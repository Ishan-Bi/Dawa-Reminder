"""Caregiver registration and session endpoints."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.security import generate_session_id, hash_password, hash_session_id, verify_password
from app.models.caregiver_session import CaregiverSession
from app.models.user import User
from app.schemas.auth import CaregiverResponse, LoginRequest, RegisterRequest
from app.services.auth import get_current_caregiver

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_id,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )


async def create_session(db: AsyncSession, user: User) -> str:
    session_id = generate_session_id()
    now = datetime.now(timezone.utc)
    db.add(CaregiverSession(
        user_id=user.id,
        session_hash=hash_session_id(session_id),
        created_at=now,
        expires_at=now + timedelta(seconds=settings.SESSION_MAX_AGE_SECONDS),
    ))
    await db.commit()
    return session_id


@router.post("/register", response_model=CaregiverResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User.id).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    try:
        await db.flush()
        session_id = await create_session(db, user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    set_session_cookie(response, session_id)
    return user


@router.post("/login", response_model=CaregiverResponse)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect")

    session_id = await create_session(db, user)
    set_session_cookie(response, session_id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if session_id:
        result = await db.execute(
            select(CaregiverSession).where(CaregiverSession.session_hash == hash_session_id(session_id))
        )
        session = result.scalar_one_or_none()
        if session is not None:
            await db.delete(session)
            await db.commit()
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )


@router.get("/me", response_model=CaregiverResponse)
async def me(user: User = Depends(get_current_caregiver)):
    return user
