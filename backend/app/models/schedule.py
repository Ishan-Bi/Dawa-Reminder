"""
Schedule model.
"""
from datetime import date
from sqlalchemy import Integer, String, Boolean, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    medication_id: Mapped[int] = mapped_column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    # times stored as JSON list of "HH:MM" e.g. ["08:00", "21:00"]
    times: Mapped[list] = mapped_column(JSON, nullable=False)
    # food_instruction: 'before_food', 'after_food', 'any'
    food_instruction: Mapped[str] = mapped_column(String(50), default="after_food", nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False) # used for pause

    # Relationships
    medication: Mapped["Medication"] = relationship("Medication", back_populates="schedules")
    dose_logs: Mapped[list["DoseLog"]] = relationship("DoseLog", back_populates="schedule", cascade="all, delete-orphan")
