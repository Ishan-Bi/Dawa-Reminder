"""
Security and authentication utilities.
Caregiver: password hashing & session management
Patient: unguessable access tokens
"""
import hashlib
import secrets
import bcrypt


def hash_password(password: str) -> str:
    """Hashes a plain password using bcrypt (truncating to 72 bytes as per bcrypt spec)."""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hash."""
    try:
        password_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def generate_patient_token() -> str:
    """Generates an unguessable 32-character url-safe access token for patients."""
    return secrets.token_urlsafe(24)


def generate_session_id() -> str:
    """Generates a secure random session token."""
    return secrets.token_urlsafe(32)


def hash_session_id(session_id: str) -> str:
    """Hash a session token before storing it in the database."""
    return hashlib.sha256(session_id.encode("utf-8")).hexdigest()
