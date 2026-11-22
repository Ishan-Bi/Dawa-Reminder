"""
Patient access router — Authenticates via unguessable access_token in URL (no login/password).
"""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.timezone import today_kolkata
from app.models.dose_log import DoseLog
from app.models.patient import Patient
from app.schemas.dose import DoseActionRequest, DoseResponse
from app.services.dose_service import get_patient_doses_for_date

router = APIRouter(prefix="/p/{token}", tags=["Patient Access"])


async def get_patient_by_token(token: str, db: AsyncSession) -> Patient:
    stmt = select(Patient).where(Patient.access_token == token)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired patient link. Please request a new link from your caregiver."
        )
    return patient


@router.get("/today")
async def get_today_view(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    patient = await get_patient_by_token(token, db)
    doses = await get_patient_doses_for_date(db, patient.id, today_kolkata())
    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "preferred_language": patient.preferred_language,
        },
        "doses": doses,
        "date": today_kolkata().isoformat(),
    }


@router.post("/doses/{dose_id}/taken", response_model=DoseResponse)
async def mark_dose_taken(
    token: str,
    dose_id: int,
    payload: DoseActionRequest = None,
    db: AsyncSession = Depends(get_db)
):
    patient = await get_patient_by_token(token, db)
    stmt = (
        select(DoseLog)
        .options(selectinload(DoseLog.medication), selectinload(DoseLog.schedule))
        .where(DoseLog.id == dose_id, DoseLog.patient_id == patient.id)
    )
    res = await db.execute(stmt)
    dose = res.scalar_one_or_none()
    if not dose:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dose not found")

    dose.status = "taken"
    dose.acted_at = (payload.acted_at if payload and payload.acted_at else datetime.now(timezone.utc))
    dose.acted_by = "patient"
    if payload and payload.client_event_id:
        dose.client_event_id = payload.client_event_id

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


@router.post("/doses/{dose_id}/skipped", response_model=DoseResponse)
async def mark_dose_skipped(
    token: str,
    dose_id: int,
    payload: DoseActionRequest = None,
    db: AsyncSession = Depends(get_db)
):
    patient = await get_patient_by_token(token, db)
    stmt = (
        select(DoseLog)
        .options(selectinload(DoseLog.medication), selectinload(DoseLog.schedule))
        .where(DoseLog.id == dose_id, DoseLog.patient_id == patient.id)
    )
    res = await db.execute(stmt)
    dose = res.scalar_one_or_none()
    if not dose:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dose not found")

    dose.status = "skipped"
    dose.acted_at = (payload.acted_at if payload and payload.acted_at else datetime.now(timezone.utc))
    dose.acted_by = "patient"
    if payload and payload.client_event_id:
        dose.client_event_id = payload.client_event_id

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
