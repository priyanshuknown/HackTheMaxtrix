"""Impact API — generate and retrieve PDF impact reports."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.match import Match
from app.models.request import FundingRequest
from app.models.funder import Funder
from app.models.impact_log import ImpactLog
from app.services.impact_agent import generate_impact_report
from app.middleware.auth import get_current_user

router = APIRouter(tags=["Impact"])


@router.get("/impact/{request_id}")
async def get_impact_report(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate or retrieve an impact report for a funded request."""
    req_result = await db.execute(
        select(FundingRequest).where(FundingRequest.id == uuid.UUID(request_id))
    )
    req = req_result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.status not in ("disbursed", "completed"):
        raise HTTPException(status_code=400, detail=f"Request not yet funded. Status: '{req.status}'")

    # Find the accepted match and its transaction
    match_result = await db.execute(
        select(Match).where(Match.request_id == req.id, Match.status == "accepted")
    )
    match = match_result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="No accepted match found")

    txn_result = await db.execute(
        select(Transaction).where(Transaction.match_id == match.id, Transaction.status == "funded")
    )
    txn = txn_result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="No funded transaction found")

    # Check if report already exists
    existing = await db.execute(
        select(ImpactLog).where(ImpactLog.transaction_id == txn.id)
    )
    impact = existing.scalar_one_or_none()

    if impact:
        return {
            "id": str(impact.id), "report_url": impact.report_url,
            "funder_name": impact.funder_name, "amount": impact.amount,
            "category": impact.category, "outcome": impact.outcome,
            "generated_at": str(impact.generated_at),
        }

    # Get funder info
    funder_result = await db.execute(select(Funder).where(Funder.id == match.funder_id))
    funder = funder_result.scalar_one_or_none()
    funder_name = funder.org_name if funder else "Anonymous Institution"

    # Generate PDF report
    report_url = generate_impact_report(
        funder_name=funder_name,
        amount=txn.amount,
        category=req.category,
        transaction_date=txn.created_at,
    )

    # Save impact log
    impact_log = ImpactLog(
        transaction_id=txn.id,
        report_url=report_url,
        funder_name=funder_name,
        amount=txn.amount,
        category=req.category,
        outcome=f"Successfully funded {req.category.replace('_', ' ')} request of Rs. {txn.amount:,}",
    )
    db.add(impact_log)

    req.status = "completed"
    await db.flush()

    return {
        "id": str(impact_log.id), "report_url": impact_log.report_url,
        "funder_name": impact_log.funder_name, "amount": impact_log.amount,
        "category": impact_log.category, "outcome": impact_log.outcome,
        "generated_at": str(impact_log.generated_at),
    }
