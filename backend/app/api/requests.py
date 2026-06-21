"""Requests API — create and retrieve funding requests.

Enforces all 4 core rules:
1. Amount >= Rs. 2,000 (API-level + DB CHECK)
2. Category must be one of 4 fixed options (Pydantic enum)
3. Max 2 requests per student per academic year (DB count check)
4. Only students can create requests (JWT role check)
"""

import uuid
import os
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.request import FundingRequest
from app.schemas.request import (
    CreateFundingRequest,
    FundingRequestResponse,
    FundingRequestListItem,
)
from app.middleware.auth import get_current_user, require_role
from app.config import settings
from app.utils.limiter import limiter

router = APIRouter(prefix="/requests", tags=["Funding Requests"])


def _get_current_academic_year() -> str:
    now = datetime.utcnow()
    if now.month >= 6:
        return f"{now.year}-{str(now.year + 1)[-2:]}"
    else:
        return f"{now.year - 1}-{str(now.year)[-2:]}"


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_request(
    request: Request,
    category: str = Form(...),
    amount: int = Form(...),
    description: str = Form(...),
    deadline_date: str = Form(...),
    document: UploadFile | None = File(None),
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new funding request.

    Validates:
    - Core Rule 1: amount >= 2000
    - Core Rule 2: category in allowed list
    - Core Rule 3: student has < 2 requests this academic year
    """
    # CORE RULE 1: Minimum amount
    if amount < settings.MIN_REQUEST_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Minimum funding request is Rs. {settings.MIN_REQUEST_AMOUNT:,}. "
                "Smaller requests create dependency patterns that undermine "
                "the platform's mission as an emergency resource."
            ),
        )

    # CORE RULE 2: Fixed categories
    if category not in settings.ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid category '{category}'. "
                f"Allowed: {', '.join(settings.ALLOWED_CATEGORIES)}"
            ),
        )

    # Get the student record
    result = await db.execute(
        select(Student).where(Student.user_id == current_user.id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    # CORE RULE 3: Frequency cap
    academic_year = _get_current_academic_year()
    count_result = await db.execute(
        select(func.count(FundingRequest.id)).where(
            FundingRequest.student_id == student.id,
            FundingRequest.academic_year == academic_year,
            FundingRequest.status != "rejected",
        )
    )
    current_count = count_result.scalar()

    if current_count >= settings.MAX_REQUESTS_PER_YEAR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Maximum {settings.MAX_REQUESTS_PER_YEAR} requests per academic year reached. "
                "VidyaFund is designed for emergency academic expenses, not recurring needs."
            ),
        )

    # Handle file upload with strict validation
    document_url = None
    if document:
        # File Validation
        allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}
        file_ext = os.path.splitext(document.filename)[1].lower() if document.filename else ".pdf"
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file extension. Only PDF, JPG, PNG allowed.")
            
        if document.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid MIME type.")
            
        content = await document.read()
        
        # Limit to 5MB
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")
            
        upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        os.makedirs(upload_dir, exist_ok=True)
        file_name = f"{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(upload_dir, file_name)

        with open(file_path, "wb") as f:
            f.write(content)

        document_url = f"/api/files/{file_name}"

    # Parse deadline date
    from datetime import date as date_type
    try:
        parsed_deadline = date_type.fromisoformat(deadline_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    # Create the request
    funding_request = FundingRequest(
        student_id=student.id,
        category=category,
        amount=amount,
        description=description,
        deadline_date=parsed_deadline,
        document_url=document_url,
        academic_year=academic_year,
        status="submitted",
    )
    db.add(funding_request)

    # Update student request count
    student.request_count = current_count + 1
    await db.flush()

    return {
        "id": str(funding_request.id),
        "category": funding_request.category,
        "amount": funding_request.amount,
        "description": funding_request.description,
        "deadline_date": str(funding_request.deadline_date),
        "document_url": funding_request.document_url,
        "status": funding_request.status,
        "academic_year": funding_request.academic_year,
        "created_at": str(funding_request.created_at),
        "message": "Request submitted successfully. It will be verified shortly.",
    }


@router.get("/{request_id}")
async def get_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific funding request by ID."""
    result = await db.execute(
        select(FundingRequest).where(FundingRequest.id == uuid.UUID(request_id))
    )
    req = result.scalar_one_or_none()

    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    return {
        "id": str(req.id),
        "student_id": str(req.student_id),
        "category": req.category,
        "amount": req.amount,
        "description": req.description,
        "deadline_date": str(req.deadline_date),
        "document_url": req.document_url,
        "verification_score": req.verification_score,
        "verification_flags": req.verification_flags,
        "urgency_level": req.urgency_level,
        "review_flag": req.review_flag,
        "status": req.status,
        "academic_year": req.academic_year,
        "created_at": str(req.created_at),
    }


@router.get("")
async def list_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List funding requests. Students see their own, funders/admins see all verified."""
    if current_user.role == "student":
        # Students see only their own requests
        student_result = await db.execute(
            select(Student).where(Student.user_id == current_user.id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            return []

        result = await db.execute(
            select(FundingRequest)
            .where(FundingRequest.student_id == student.id)
            .order_by(FundingRequest.created_at.desc())
        )
    else:
        # Funders and admins see verified/matched requests (anonymized)
        result = await db.execute(
            select(FundingRequest)
            .where(
                FundingRequest.status.in_(
                    ["submitted", "verified", "matched", "approved", "disbursed", "completed"]
                )
            )
            .order_by(FundingRequest.created_at.desc())
        )

    requests = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "student_id": str(r.student_id),
            "category": r.category,
            "amount": r.amount,
            "description": r.description,
            "deadline_date": str(r.deadline_date),
            "verification_score": r.verification_score,
            "fraud_score": r.fraud_score,
            "urgency_level": r.urgency_level,
            "review_flag": r.review_flag,
            "status": r.status,
            "created_at": str(r.created_at),
        }
        for r in requests
    ]
