"""
Medications and Schedules router.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.medication import Medication
from app.models.schedule import Schedule
from app.models.patient import Patient
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationResponse,
    MedicationUpdate,
    ScheduleCreate,
    ScheduleResponse,
    ScheduleUpdate,
)
from app.services.auth import get_current_caregiver

router = APIRouter(tags=["Medications & Schedules"])


async def verify_patient_ownership(patient_id: int, caregiver: User, db: AsyncSession) -> Patient:
    stmt = select(Patient).where(Patient.id == patient_id, Patient.caregiver_id == caregiver.id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or unauthorized",
        )
    return patient


async def verify_medication_ownership(medication_id: int, caregiver: User, db: AsyncSession) -> Medication:
    stmt = (
        select(Medication)
        .join(Patient, Medication.patient_id == Patient.id)
        .where(Medication.id == medication_id, Patient.caregiver_id == caregiver.id)
        .options(selectinload(Medication.schedules))
    )
    result = await db.execute(stmt)
    med = result.scalar_one_or_none()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found or unauthorized",
        )
    return med


@router.get("/patients/{patient_id}/medications", response_model=List[MedicationResponse])
async def list_medications(
    patient_id: int,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    await verify_patient_ownership(patient_id, caregiver, db)
    stmt = (
        select(Medication)
        .where(Medication.patient_id == patient_id)
        .options(selectinload(Medication.schedules))
        .order_by(Medication.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/patients/{patient_id}/medications", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
async def create_medication(
    patient_id: int,
    payload: MedicationCreate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    await verify_patient_ownership(patient_id, caregiver, db)
    med = Medication(
        patient_id=patient_id,
        name=payload.name,
        strength=payload.strength,
        dosage_instructions=payload.dosage_instructions,
        purpose=payload.purpose,
        photo_url=payload.photo_url,
        prescription_notes=payload.prescription_notes,
        active=True,
    )
    db.add(med)
    await db.flush()

    if payload.schedule:
        sched = Schedule(
            medication_id=med.id,
            times=payload.schedule.times,
            food_instruction=payload.schedule.food_instruction,
            start_date=payload.schedule.start_date,
            end_date=payload.schedule.end_date,
            active=payload.schedule.active,
        )
        db.add(sched)

    await db.commit()

    # Re-fetch with loaded schedules
    stmt = select(Medication).where(Medication.id == med.id).options(selectinload(Medication.schedules))
    result = await db.execute(stmt)
    return result.scalar_one()


@router.patch("/medications/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: int,
    payload: MedicationUpdate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    med = await verify_medication_ownership(medication_id, caregiver, db)
    for field in (
        "name",
        "strength",
        "dosage_instructions",
        "purpose",
        "photo_url",
        "prescription_notes",
        "active",
    ):
        if field in payload.model_fields_set:
            setattr(med, field, getattr(payload, field))

    await db.commit()
    await db.refresh(med)
    return med


@router.post("/medications/{medication_id}/schedules", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    medication_id: int,
    payload: ScheduleCreate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    med = await verify_medication_ownership(medication_id, caregiver, db)
    sched = Schedule(
        medication_id=med.id,
        times=payload.times,
        food_instruction=payload.food_instruction,
        start_date=payload.start_date,
        end_date=payload.end_date,
        active=payload.active,
    )
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return sched


@router.patch("/schedules/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: int,
    payload: ScheduleUpdate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Schedule)
        .join(Medication, Schedule.medication_id == Medication.id)
        .join(Patient, Medication.patient_id == Patient.id)
        .where(Schedule.id == schedule_id, Patient.caregiver_id == caregiver.id)
    )
    result = await db.execute(stmt)
    sched = result.scalar_one_or_none()
    if not sched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found or unauthorized")

    if payload.times is not None:
        sched.times = payload.times
    if payload.food_instruction is not None:
        sched.food_instruction = payload.food_instruction
    if payload.start_date is not None:
        sched.start_date = payload.start_date
    if payload.end_date is not None:
        sched.end_date = payload.end_date
    if payload.active is not None:
        sched.active = payload.active

    await db.commit()
    await db.refresh(sched)
    return sched
