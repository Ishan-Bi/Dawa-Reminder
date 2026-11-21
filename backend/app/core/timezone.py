"""
Timezone helpers for Asia/Kolkata handling.
Per specification:
- Fixed times of day interpreted in Asia/Kolkata.
- Store timestamps in UTC in database.
- Convert at edges.
"""
from datetime import datetime, date, time
from zoneinfo import ZoneInfo

KOLKATA_TZ = ZoneInfo("Asia/Kolkata")
UTC_TZ = ZoneInfo("UTC")


def now_kolkata() -> datetime:
    """Returns current datetime in Asia/Kolkata."""
    return datetime.now(KOLKATA_TZ)


def now_utc() -> datetime:
    """Returns current datetime in UTC."""
    return datetime.now(UTC_TZ)


def today_kolkata() -> date:
    """Returns today's date in Asia/Kolkata."""
    return now_kolkata().date()


def to_utc_datetime(target_date: date, time_str: str) -> datetime:
    """
    Parses 'HH:MM' string on target_date in Asia/Kolkata and converts to UTC datetime.
    """
    hour, minute = map(int, time_str.split(":"))
    t = time(hour=hour, minute=minute)
    kolkata_dt = datetime.combine(target_date, t, tzinfo=KOLKATA_TZ)
    return kolkata_dt.astimezone(UTC_TZ)


def to_kolkata_display(dt: datetime) -> str:
    """Formats UTC or tz-aware datetime to Asia/Kolkata HH:MM display."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC_TZ)
    kolkata_dt = dt.astimezone(KOLKATA_TZ)
    return kolkata_dt.strftime("%H:%M")
