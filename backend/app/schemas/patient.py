"""
Pydantic schemas for Patient management.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=130)
    preferred_language: str = Field("hi", pattern="^(en|hi)$")
    notes: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=130)
    preferred_language: Optional[str] = Field(None, pattern="^(en|hi)$")
    notes: Optional[str] = None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    caregiver_id: int
    name: str
    age: Optional[int]
    preferred_language: str
    notes: Optional[str]
    access_token: str
    created_at: datetime
