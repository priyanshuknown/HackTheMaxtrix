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
from app.services.verification_agent import extract_text
from app.services.ai_agent import analyze_request
from app.services.urgency_engine import calculate_urgency
from app.middleware.auth import get_current_user
from app.config import settings
from app.utils.limiter import limiter
from fastapi import Request
import json

router = APIRouter(tags=["Verification"])


@router.post("/verify/{request_id}")
@limiter.limit("5/minute")
async def verify_request(
    request: Request,
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run AI verification and analysis on a submitted request."""
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

    student_result = await db.execute(
        select(Student).where(Student.id == req.student_id)
    )
    student = student_result.scalar_one_or_none()
    existing_count = student.request_count if student else 0

    # 1. Document verification & AI analysis
    extracted_text = ""
    if req.document_url:
        file_path = os.path.join(
            os.path.abspath(settings.UPLOAD_DIR),
            os.path.basename(req.document_url),
        )
        if os.path.exists(file_path):
            extracted_text = await extract_text(file_path) or ""

    ai_analysis = await analyze_request(extracted_text, req.amount, existing_count)

    req.verification_score = 100 - ai_analysis["fraud_score"]
    req.verification_flags = ai_analysis["fraud_reasons"]
    
    req.fraud_score = ai_analysis["fraud_score"]
    req.fraud_reasons_json = json.dumps(ai_analysis["fraud_reasons"])
    req.impact_score = ai_analysis["impact_score"]
    req.impact_reasons_json = json.dumps(ai_analysis["impact_reasons"])
    
    req.urgency_level = ai_analysis["urgency_level"]
    req.urgency_reasons_json = json.dumps(ai_analysis["urgency_reasons"])
    req.review_flag = existing_count >= 1

    # Update status
    req.status = "verified"

    await db.flush()

    return {
        "id": str(req.id),
        "status": "verified",
        "ai_analysis": ai_analysis,
        "message": "Request verified and AI scored successfully.",
    }

