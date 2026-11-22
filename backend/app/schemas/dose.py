"""
Pydantic schemas for Dose Tracking and History.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DoseActionRequest(BaseModel):
    acted_at: Optional[datetime] = None
    client_event_id: Optional[str] = None


class DoseUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|taken|skipped|missed)$")
    acted_at: Optional[datetime] = None
    acted_by: Optional[str] = Field("caregiver", pattern="^(patient|caregiver)$")


class DoseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    medication_id: int
    schedule_id: int
    scheduled_at: datetime
    status: str
    acted_at: Optional[datetime]
    acted_by: Optional[str]
    client_event_id: Optional[str]

    # Nested medication info for display
    medication_name: Optional[str] = None
    medication_strength: Optional[str] = None
    medication_instructions: Optional[str] = None
    medication_purpose: Optional[str] = None
    medication_photo: Optional[str] = None
    food_instruction: Optional[str] = None
