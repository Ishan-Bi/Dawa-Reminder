"""
DoseLog model.
"""
from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class DoseLog(Base):
    __tablename__ = "dose_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_id: Mapped[int] = mapped_column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    schedule_id: Mapped[int] = mapped_column(Integer, ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    # status: 'pending', 'taken', 'skipped', 'missed'
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    acted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    # acted_by: 'patient' or 'caregiver'
    acted_by: Mapped[str] = mapped_column(String(50), nullable=True)
    # client_event_id for duplicate-safe offline sync
    client_event_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=True)

    __table_args__ = (
        UniqueConstraint("schedule_id", "scheduled_at", name="uq_schedule_scheduled_at"),
    )

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="dose_logs")
    medication: Mapped["Medication"] = relationship("Medication", back_populates="dose_logs")
    schedule: Mapped["Schedule"] = relationship("Schedule", back_populates="dose_logs")
