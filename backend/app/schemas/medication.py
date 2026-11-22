"""
Pydantic schemas for Medications and Schedules.
"""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ScheduleCreate(BaseModel):
    times: List[str] = Field(..., min_length=1, description="List of HH:MM strings")
    food_instruction: str = Field("after_food", pattern="^(before_food|after_food|any)$")
    start_date: date = Field(default_factory=date.today)
    end_date: Optional[date] = None
    active: bool = True


class ScheduleUpdate(BaseModel):
    times: Optional[List[str]] = None
    food_instruction: Optional[str] = Field(None, pattern="^(before_food|after_food|any)$")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    active: Optional[bool] = None


class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    medication_id: int
    times: List[str]
    food_instruction: str
    start_date: date
    end_date: Optional[date]
    active: bool


class MedicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    strength: Optional[str] = None
    dosage_instructions: Optional[str] = None
    purpose: Optional[str] = None
    photo_url: Optional[str] = None
    prescription_notes: Optional[str] = None
    schedule: Optional[ScheduleCreate] = None


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    strength: Optional[str] = None
    dosage_instructions: Optional[str] = None
    purpose: Optional[str] = None
    photo_url: Optional[str] = None
    prescription_notes: Optional[str] = None
    active: Optional[bool] = None


class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    name: str
    strength: Optional[str]
    dosage_instructions: Optional[str]
    purpose: Optional[str]
    photo_url: Optional[str]
    prescription_notes: Optional[str]
    active: bool
    created_at: datetime
    schedules: List[ScheduleResponse] = []
