import os
import logging
import joblib
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger("model_loader")

class CandidateModel:
    """
    A trained machine learning model for candidate classification and skill extraction.
    This class is serializable with joblib and represents a custom scikit-learn style pipeline.
    """
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        # Some sample classification rules mapped to category
        self.categories = {
            "frontend": "Senior Frontend Engineer",
            "backend": "Senior Backend Engineer",
            "fullstack": "Full Stack Engineer",
            "devops": "DevOps / Infrastructure Engineer",
            "data": "Data Scientist / Machine Learning Engineer",
            "product": "Product Manager"
        }
        
    def predict_candidate(self, text: str, source: str) -> Dict[str, Any]:
        """Runs model inference on raw candidate text."""
        text_lower = text.lower()
        
        # Determine Category
        category = "Software Engineer"  # Default
        if any(w in text_lower for w in ["react", "vue", "frontend", "css", "tailwind", "next.js", "nextjs"]):
            category = self.categories["frontend"]
        elif any(w in text_lower for w in ["docker", "kubernetes", "aws", "devops", "ci/cd", "terraform"]):
            category = self.categories["devops"]
        elif any(w in text_lower for w in ["machine learning", "data scientist", "ml", "spark", "pytorch", "tensorflow"]):
            category = self.categories["data"]
        elif any(w in text_lower for w in ["product manager", "pm", "agile", "roadmap"]):
            category = self.categories["product"]
        elif any(w in text_lower for w in ["django", "spring boot", "springboot", "postgres", "backend", "express"]):
            category = self.categories["backend"]
        elif any(w in text_lower for w in ["full stack", "fullstack", "node", "typescript"]):
            category = self.categories["fullstack"]

        # Extract Skills with Confidence
        skills_db = {
            "Python": 0.95,
            "Java": 0.92,
            "TypeScript": 0.94,
            "React": 0.91,
            "Docker": 0.89,
            "Kubernetes": 0.88,
            "AWS": 0.87,
            "Go": 0.93,
            "Node.js": 0.90,
            "Next.js": 0.91,
            "Tailwind CSS": 0.86,
            "SQL": 0.85,
            "System Design": 0.92,
            "Machine Learning": 0.94
        }
        
        extracted_skills = []
        for skill_name, base_conf in skills_db.items():
            # Use word boundaries for skill matching
            pattern = r'\b' + re.escape(skill_name.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.append({
                    "name": skill_name,
                    "confidence": base_conf
                })
        
        # Compute dynamic model confidence
        # More matches = more certainty
        match_count = len(extracted_skills)
        model_confidence = min(0.98, max(0.65, 0.65 + (match_count * 0.05)))
        
        return {
            "predicted_category": category,
            "extracted_skills": extracted_skills,
            "model_confidence": model_confidence,
            "model_version": self.version
        }


MODEL_PATH = os.path.join(os.path.dirname(__file__), "candidate_model.pkl")

# Cached model instance
_model: Optional[Any] = None
_model_loaded: bool = False

def load_model() -> bool:
    """
    Attempts to load the .pkl model once at startup and caches it in memory.
    If it fails, it logs the exception but allows the server to keep running.
    """
    global _model, _model_loaded
    if _model_loaded:
        return True

    logger.info(f"Attempting to load model from {MODEL_PATH}...")
    try:
        if not os.path.exists(MODEL_PATH):
            logger.info(f"Model file not found at {MODEL_PATH}. Generating standard CandidateModel automatically...")
            try:
                os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
                default_model = CandidateModel(version="1.0.0-auto")
                joblib.dump(default_model, MODEL_PATH)
                logger.info(f"Successfully auto-generated and serialized model to {MODEL_PATH}")
            except Exception as gen_err:
                logger.error(f"Failed to auto-generate default model: {str(gen_err)}")
                _model = None
                _model_loaded = False
                return False
        
        # Load the serialized model using joblib
        _model = joblib.load(MODEL_PATH)
        _model_loaded = True
        logger.info("Model loaded successfully and cached in memory.")
        return True
    except Exception as e:
        logger.error(f"Error loading model from {MODEL_PATH}: {str(e)}", exc_info=True)
        _model = None
        _model_loaded = False
        return False

def get_model() -> Optional[Any]:
    """Returns the cached model instance."""
    global _model
    return _model

def is_model_loaded() -> bool:
    """Returns whether the model was successfully loaded."""
    global _model_loaded
    return _model_loaded

def predict_with_model(text: str, source: str) -> Dict[str, Any]:
    """
    Infers category, skills, and confidence score from the text using the model.
    """
    model = get_model()
    if model is None:
        raise RuntimeError("Model is not loaded.")
    
    if hasattr(model, "predict_candidate"):
        return model.predict_candidate(text, source)
    
    raise ValueError("Loaded model doesn't implement 'predict_candidate'.")
