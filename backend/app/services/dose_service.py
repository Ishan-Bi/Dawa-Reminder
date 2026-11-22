"""
Dose generation and status management service.
"""
from datetime import date, datetime, timedelta, timezone
from typing import List
from sqlalchemy import select, and_
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.timezone import today_kolkata, to_utc_datetime, now_utc
from app.models.dose_log import DoseLog
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.patient import Patient


async def generate_doses_for_date(
    db: AsyncSession,
    patient_id: int,
    target_date: date = None,
) -> None:
    """
    On-demand dose generation for a specific date (interpreted in Asia/Kolkata).
    Creates missing dose_logs for all active schedules of active medications.
    Duplicate-safe using unique constraint on (schedule_id, scheduled_at).
    """
    if target_date is None:
        target_date = today_kolkata()

    # Query active schedules of active medications for this patient
    stmt = (
        select(Schedule)
        .join(Medication, Schedule.medication_id == Medication.id)
        .where(
            Medication.patient_id == patient_id,
            Medication.active == True,
            Schedule.active == True,
            Schedule.start_date <= target_date,
            (Schedule.end_date == None) | (Schedule.end_date >= target_date),
        )
    )
    result = await db.execute(stmt)
    schedules = result.scalars().all()

    for sched in schedules:
        times = sched.times if isinstance(sched.times, list) else []
        for time_str in times:
            utc_scheduled_at = to_utc_datetime(target_date, time_str)

            # Check if dose_log already exists
            existing_check = await db.execute(
                select(DoseLog.id).where(
                    DoseLog.schedule_id == sched.id,
                    DoseLog.scheduled_at == utc_scheduled_at,
                )
            )
            if existing_check.scalar_one_or_none() is not None:
                continue

            # Create new pending dose
            new_dose = DoseLog(
                patient_id=patient_id,
                medication_id=sched.medication_id,
                schedule_id=sched.id,
                scheduled_at=utc_scheduled_at,
                status="pending",
            )
            db.add(new_dose)

    await db.commit()


def compute_derived_status(dose: DoseLog, grace_hours: int = 2) -> str:
    """
    Derives 'missed' status if still pending after the grace period past scheduled_at.
    """
    if dose.status in ("taken", "skipped"):
        return dose.status

    current_utc = now_utc()
    scheduled_utc = dose.scheduled_at
    if scheduled_utc.tzinfo is None:
        scheduled_utc = scheduled_utc.replace(tzinfo=timezone.utc)

    if current_utc > scheduled_utc + timedelta(hours=grace_hours):
        return "missed"
    return "pending"


async def get_patient_doses_for_date(
    db: AsyncSession,
    patient_id: int,
    target_date: date = None,
) -> List[dict]:
    """
    Generates and returns formatted doses for a given date.
    """
    if target_date is None:
        target_date = today_kolkata()

    # Ensure missing doses are generated first
    await generate_doses_for_date(db, patient_id, target_date)

    # Calculate UTC window for target_date in Asia/Kolkata
    start_utc = to_utc_datetime(target_date, "00:00")
    end_utc = to_utc_datetime(target_date + timedelta(days=1), "00:00")

    stmt = (
        select(DoseLog)
        .options(
            selectinload(DoseLog.medication),
            selectinload(DoseLog.schedule),
        )
        .where(
            DoseLog.patient_id == patient_id,
            DoseLog.scheduled_at >= start_utc,
            DoseLog.scheduled_at < end_utc,
        )
        .order_by(DoseLog.scheduled_at.asc())
    )
    result = await db.execute(stmt)
    doses = result.scalars().all()

    formatted_doses = []
    for d in doses:
        current_status = compute_derived_status(d)
        formatted_doses.append({
            "id": d.id,
            "patient_id": d.patient_id,
            "medication_id": d.medication_id,
            "schedule_id": d.schedule_id,
            "scheduled_at": d.scheduled_at,
            "status": current_status,
            "acted_at": d.acted_at,
            "acted_by": d.acted_by,
            "client_event_id": d.client_event_id,
            "medication_name": d.medication.name if d.medication else None,
            "medication_strength": d.medication.strength if d.medication else None,
            "medication_instructions": d.medication.dosage_instructions if d.medication else None,
            "medication_purpose": d.medication.purpose if d.medication else None,
            "medication_photo": d.medication.photo_url if d.medication else None,
            "food_instruction": d.schedule.food_instruction if d.schedule else None,
        })

    return formatted_doses
