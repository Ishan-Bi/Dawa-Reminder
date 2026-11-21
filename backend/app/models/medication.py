"""
Medication model.
"""
from datetime import datetime, timezone
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    strength: Mapped[str] = mapped_column(String(100), nullable=True) # e.g. "500mg"
    dosage_instructions: Mapped[str] = mapped_column(String(255), nullable=True) # e.g. "1 गोली" / "1 tablet"
    purpose: Mapped[str] = mapped_column(String(255), nullable=True) # e.g. "Blood Pressure"
    photo_url: Mapped[str] = mapped_column(String(1024), nullable=True)
    prescription_notes: Mapped[str] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="medications")
    schedules: Mapped[list["Schedule"]] = relationship("Schedule", back_populates="medication", cascade="all, delete-orphan")
    dose_logs: Mapped[list["DoseLog"]] = relationship("DoseLog", back_populates="medication", cascade="all, delete-orphan")
