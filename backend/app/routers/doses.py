"""
Doses router — Caregiver interface for monitoring and manual status toggle.
"""
from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.timezone import today_kolkata
from app.models.dose_log import DoseLog
from app.models.patient import Patient
from app.models.user import User
from app.schemas.dose import DoseResponse, DoseUpdate
from app.services.auth import get_current_caregiver
from app.services.dose_service import get_patient_doses_for_date

router = APIRouter(tags=["Caregiver Doses"])


@router.get("/patients/{patient_id}/doses", response_model=List[DoseResponse])
async def get_doses(
    patient_id: int,
    date_str: Optional[str] = Query(None, alias="date"),
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    # Verify patient belongs to caregiver
    stmt = select(Patient.id).where(Patient.id == patient_id, Patient.caregiver_id == caregiver.id)
    res = await db.execute(stmt)
    if res.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found or unauthorized")

    target_date = date.fromisoformat(date_str) if date_str else today_kolkata()
    return await get_patient_doses_for_date(db, patient_id, target_date)


@router.get("/patients/{patient_id}/history", response_model=List[DoseResponse])
async def get_history(
    patient_id: int,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Patient.id).where(Patient.id == patient_id, Patient.caregiver_id == caregiver.id)
    res = await db.execute(stmt)
    if res.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found or unauthorized")

    query = (
        select(DoseLog)
        .options(selectinload(DoseLog.medication), selectinload(DoseLog.schedule))
        .where(DoseLog.patient_id == patient_id)
        .order_by(DoseLog.scheduled_at.desc())
    )
    result = await db.execute(query)
    doses = result.scalars().all()

    return [
        {
            "id": d.id,
            "patient_id": d.patient_id,
            "medication_id": d.medication_id,
            "schedule_id": d.schedule_id,
            "scheduled_at": d.scheduled_at,
            "status": d.status,
            "acted_at": d.acted_at,
            "acted_by": d.acted_by,
            "client_event_id": d.client_event_id,
            "medication_name": d.medication.name if d.medication else None,
            "medication_strength": d.medication.strength if d.medication else None,
            "medication_instructions": d.medication.dosage_instructions if d.medication else None,
            "medication_purpose": d.medication.purpose if d.medication else None,
            "medication_photo": d.medication.photo_url if d.medication else None,
            "food_instruction": d.schedule.food_instruction if d.schedule else None,
        }
        for d in doses
    ]


@router.patch("/doses/{dose_id}", response_model=DoseResponse)
async def update_dose_status(
    dose_id: int,
    payload: DoseUpdate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(DoseLog)
        .join(Patient, DoseLog.patient_id == Patient.id)
        .options(selectinload(DoseLog.medication), selectinload(DoseLog.schedule))
        .where(DoseLog.id == dose_id, Patient.caregiver_id == caregiver.id)
    )
    res = await db.execute(stmt)
    dose = res.scalar_one_or_none()
    if not dose:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dose not found or unauthorized")

    dose.status = payload.status
    dose.acted_at = payload.acted_at or datetime.now(timezone.utc)
    dose.acted_by = payload.acted_by or "caregiver"

    await db.commit()
    await db.refresh(dose)

    return {
        "id": dose.id,
        "patient_id": dose.patient_id,
        "medication_id": dose.medication_id,
        "schedule_id": dose.schedule_id,
        "scheduled_at": dose.scheduled_at,
        "status": dose.status,
        "acted_at": dose.acted_at,
        "acted_by": dose.acted_by,
        "client_event_id": dose.client_event_id,
        "medication_name": dose.medication.name if dose.medication else None,
        "medication_strength": dose.medication.strength if dose.medication else None,
        "medication_instructions": dose.medication.dosage_instructions if dose.medication else None,
        "medication_purpose": dose.medication.purpose if dose.medication else None,
        "medication_photo": dose.medication.photo_url if dose.medication else None,
        "food_instruction": dose.schedule.food_instruction if dose.schedule else None,
    }
