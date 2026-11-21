"""
Patient model.
"""
from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    caregiver_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False) # 'en' or 'hi'
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    access_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    caregiver: Mapped["User"] = relationship("User", back_populates="patients")
    medications: Mapped[list["Medication"]] = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    dose_logs: Mapped[list["DoseLog"]] = relationship("DoseLog", back_populates="patient", cascade="all, delete-orphan")
