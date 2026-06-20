"""Match API — runs the matching engine to find best institutional funders."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.request import FundingRequest
from app.models.funder import Funder
from app.models.match import Match
from app.services.matching_engine import match_funders
from app.middleware.auth import get_current_user

router = APIRouter(tags=["Matching"])


@router.get("/match/{request_id}")
async def match_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run matching engine for a verified request."""
    result = await db.execute(
        select(FundingRequest).where(FundingRequest.id == uuid.UUID(request_id))
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status not in ("verified", "matched"):
        raise HTTPException(status_code=400, detail=f"Request must be verified first. Current: '{req.status}'")

    funder_result = await db.execute(select(Funder).where(Funder.available_balance > 0))
    funders = funder_result.scalars().all()
    if not funders:
        raise HTTPException(status_code=404, detail="No institutional funders available")

    ranked = match_funders(req.category, req.amount, funders)
    if not ranked:
        raise HTTPException(status_code=404, detail="No funders match this category")

    # Clear old matches
    old = await db.execute(select(Match).where(Match.request_id == req.id))
    for o in old.scalars().all():
        await db.delete(o)

    match_records = []
    for r in ranked:
        m = Match(request_id=req.id, funder_id=uuid.UUID(r["funder_id"]),
                  match_score=r["match_score"], status="proposed")
        db.add(m)
        match_records.append({
            "match_id": str(m.id), "funder_id": r["funder_id"],
            "funder_name": r["org_name"], "funder_type": r["funder_type"],
            "match_score": r["match_score"], "available_balance": r["available_balance"],
            "status": "proposed",
        })

    req.status = "matched"
    await db.flush()
    return {"request_id": str(req.id), "status": "matched", "matches": match_records}
