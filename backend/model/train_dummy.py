import os
import sys
import joblib

# Make sure backend is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.model.model_loader import CandidateModel, MODEL_PATH

def serialize_dummy_model():
    print("Initializing dummy CandidateModel...")
    model = CandidateModel(version="1.0.0-dummy")
    
    # Create directory if not exists
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    print(f"Serializing model to {MODEL_PATH} using joblib...")
    joblib.dump(model, MODEL_PATH)
    print("Model serialized successfully!")

if __name__ == "__main__":
    serialize_dummy_model()
