"""Auth API — registration and login endpoints."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.funder import Funder
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import hash_password, verify_password
from app.middleware.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_current_academic_year() -> str:
    """Return current academic year string, e.g., '2025-26'."""
    from datetime import datetime
    now = datetime.utcnow()
    # Academic year starts in June/July typically
    if now.month >= 6:
        return f"{now.year}-{str(now.year + 1)[-2:]}"
    else:
        return f"{now.year - 1}-{str(now.year)[-2:]}"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Register a new user with role-specific profile creation."""

    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role.value,
    )
    db.add(user)
    await db.flush()  # Get user.id before creating linked records

    # Create role-specific record
    if data.role.value == "student":
        if not data.institution or not data.enrollment_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Students must provide institution and enrollment_id",
            )
        student = Student(
            user_id=user.id,
            institution=data.institution,
            enrollment_id=data.enrollment_id,
            academic_year=_get_current_academic_year(),
        )
        db.add(student)

    elif data.role.value == "funder":
        if not data.org_name or not data.funder_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Funders must provide org_name and funder_type",
            )
        import json
        funder = Funder(
            user_id=user.id,
            org_name=data.org_name,
            funder_type=data.funder_type,
            categories_supported_json=json.dumps(data.categories_supported or []),
            available_balance=0,
        )
        db.add(funder)

    # Generate JWT token
    token = create_access_token({"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=str(user.id),
        full_name=user.full_name,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Authenticate user and return JWT token."""

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=str(user.id),
        full_name=user.full_name,
    )
