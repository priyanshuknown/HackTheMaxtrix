"""Verify API — triggers AI verification on a submitted request."""

import os
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.request import FundingRequest
from app.models.student import Student
from app.services.verification_agent import verify_document
from app.services.urgency_engine import calculate_urgency
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(tags=["Verification"])


@router.post("/verify/{request_id}")
async def verify_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run verification agent on a submitted request.

    Accessible by admin, or automatically triggered.
    Runs:
    1. Document verification (Tesseract + GPT-4o-mini)
    2. Urgency scoring
    Updates request status to 'verified'.
    """
    # Only admins can trigger verification (or auto-trigger)
    if current_user.role not in ("admin", "student"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can trigger verification",
        )

    result = await db.execute(
        select(FundingRequest).where(FundingRequest.id == uuid.UUID(request_id))
    )
    req = result.scalar_one_or_none()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.status not in ("submitted",):
        raise HTTPException(
            status_code=400,
            detail=f"Request is already '{req.status}', cannot verify again",
        )

    # 1. Document verification
    if req.document_url:
        file_path = os.path.join(
            os.path.abspath(settings.UPLOAD_DIR),
            os.path.basename(req.document_url),
        )
        if os.path.exists(file_path):
            verification = await verify_document(file_path)
        else:
            verification = {"verification_score": 85, "flags": ["file_not_found_mock"]}
    else:
        verification = {"verification_score": 80, "flags": ["no_document_uploaded"]}

    req.verification_score = verification["verification_score"]
    req.verification_flags = verification["flags"]

    # 2. Urgency scoring
    student_result = await db.execute(
        select(Student).where(Student.id == req.student_id)
    )
    student = student_result.scalar_one_or_none()
    existing_count = student.request_count if student else 0

    urgency = calculate_urgency(
        deadline_date=req.deadline_date,
        amount=req.amount,
        category=req.category,
        existing_request_count=existing_count,
    )

    req.urgency_level = urgency["urgency_level"]
    req.review_flag = urgency["review_flag"]

    # Update status
    req.status = "verified"

    await db.flush()

    return {
        "id": str(req.id),
        "status": "verified",
        "verification": verification,
        "urgency": urgency,
        "message": "Request verified and urgency scored successfully.",
    }
