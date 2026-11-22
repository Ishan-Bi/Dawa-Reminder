"""
Patients router — scoped strictly to the authenticated caregiver.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import generate_patient_token
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.services.auth import get_current_caregiver

router = APIRouter(prefix="/patients", tags=["Patients"])


async def get_caregiver_patient(patient_id: int, caregiver: User, db: AsyncSession) -> Patient:
    """Helper ensuring the patient belongs to the logged-in caregiver."""
    stmt = select(Patient).where(
        Patient.id == patient_id,
        Patient.caregiver_id == caregiver.id
    )
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or you do not have permission to access this patient"
        )
    return patient


@router.get("", response_model=List[PatientResponse])
async def list_patients(
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Patient).where(Patient.caregiver_id == caregiver.id).order_by(Patient.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    token = generate_patient_token()
    patient = Patient(
        caregiver_id=caregiver.id,
        name=payload.name,
        age=payload.age,
        preferred_language=payload.preferred_language,
        notes=payload.notes,
        access_token=token,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    return await get_caregiver_patient(patient_id, caregiver, db)


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    patient = await get_caregiver_patient(patient_id, caregiver, db)
    if payload.name is not None:
        patient.name = payload.name
    if payload.age is not None:
        patient.age = payload.age
    if payload.preferred_language is not None:
        patient.preferred_language = payload.preferred_language
    if payload.notes is not None:
        patient.notes = payload.notes

    await db.commit()
    await db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: int,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    patient = await get_caregiver_patient(patient_id, caregiver, db)
    await db.delete(patient)
    await db.commit()


@router.post("/{patient_id}/regenerate-token", response_model=PatientResponse)
async def regenerate_token(
    patient_id: int,
    caregiver: User = Depends(get_current_caregiver),
    db: AsyncSession = Depends(get_db)
):
    patient = await get_caregiver_patient(patient_id, caregiver, db)
    patient.access_token = generate_patient_token()
    await db.commit()
    await db.refresh(patient)
    return patient
