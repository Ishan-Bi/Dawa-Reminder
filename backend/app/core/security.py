"""
Security and authentication utilities.
Caregiver: password hashing & session management
Patient: unguessable access tokens
"""
import hashlib
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hashes a plain password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hash."""
    return pwd_context.verify(plain_password, hashed_password)


def generate_patient_token() -> str:
    """Generates an unguessable 32-character url-safe access token for patients."""
    return secrets.token_urlsafe(24)


def generate_session_id() -> str:
    """Generates a secure random session token."""
    return secrets.token_urlsafe(32)


def hash_session_id(session_id: str) -> str:
    """Hash a session token before storing it in the database."""
    return hashlib.sha256(session_id.encode("utf-8")).hexdigest()
