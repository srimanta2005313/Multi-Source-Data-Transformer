from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class PredictRequest(BaseModel):
    text: str = Field(..., description="Raw resume/notes/LinkedIn text to analyze")
    source: str = Field(..., description="Which source type this came from (resume|notes|linkedin|csv|ats|github)")

    @field_validator("text")
    @classmethod
    def validate_text_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Input text cannot be empty or whitespace-only")
        return v

class SkillPrediction(BaseModel):
    name: str
    confidence: float

class PredictResponse(BaseModel):
    predicted_category: Optional[str] = None
    extracted_skills: List[SkillPrediction] = []
    model_confidence: float
    model_version: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
