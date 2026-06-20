"""Disburse API — funder approves a match, creates Razorpay order."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.match import Match
from app.models.request import FundingRequest
from app.models.funder import Funder
from app.models.transaction import Transaction
from app.services.razorpay_service import create_order, verify_payment
from app.schemas.impact import DisburseResponse, PaymentVerification
from app.middleware.auth import get_current_user, require_role
from app.config import settings

router = APIRouter(tags=["Disbursement"])


@router.post("/disburse/{match_id}")
async def disburse(
    match_id: str,
    current_user: User = Depends(require_role("funder", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """Funder approves a match — creates Razorpay order for full amount."""
    result = await db.execute(
        select(Match).where(Match.id == uuid.UUID(match_id))
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != "proposed":
        raise HTTPException(status_code=400, detail=f"Match already '{match.status}'")

    # Get the request for amount
    req_result = await db.execute(
        select(FundingRequest).where(FundingRequest.id == match.request_id)
    )
    req = req_result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Create Razorpay order for FULL amount, ONE transaction
    order = create_order(amount=req.amount, request_id=str(req.id))

    # Create transaction record
    txn = Transaction(
        match_id=match.id,
        razorpay_order_id=order["id"],
        amount=req.amount,
        status="pending",
    )
    db.add(txn)

    # Update statuses
    match.status = "accepted"
    req.status = "approved"
    await db.flush()

    return {
        "transaction_id": str(txn.id),
        "razorpay_order_id": order["id"],
        "amount": req.amount,
        "amount_paise": req.amount * 100,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "request_id": str(req.id),
        "match_id": str(match.id),
    }


@router.post("/verify-payment")
async def verify_payment_endpoint(
    data: PaymentVerification,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Razorpay payment after checkout completion."""
    is_valid = verify_payment(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    )

    # Find the transaction by order_id
    result = await db.execute(
        select(Transaction).where(
            Transaction.razorpay_order_id == data.razorpay_order_id
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if is_valid:
        txn.status = "funded"
        txn.razorpay_payment_id = data.razorpay_payment_id

        # Update request status to disbursed
        match_result = await db.execute(
            select(Match).where(Match.id == txn.match_id)
        )
        match = match_result.scalar_one_or_none()
        if match:
            req_result = await db.execute(
                select(FundingRequest).where(FundingRequest.id == match.request_id)
            )
            req = req_result.scalar_one_or_none()
            if req:
                req.status = "disbursed"

            # Deduct from funder balance
            funder_result = await db.execute(
                select(Funder).where(Funder.id == match.funder_id)
            )
            funder = funder_result.scalar_one_or_none()
            if funder:
                funder.available_balance = max(0, funder.available_balance - txn.amount)

        await db.flush()
        return {"status": "funded", "transaction_id": str(txn.id), "message": "Payment verified successfully"}
    else:
        txn.status = "failed"
        await db.flush()
        raise HTTPException(status_code=400, detail="Payment verification failed")


@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    db: AsyncSession = Depends(get_db),
):
    """Razorpay webhook — updates transaction on payment events.
    In production, verify webhook signature. For hackathon demo, simplified."""
    # Webhook implementation would verify razorpay signature
    # For demo purposes, payment verification is handled via /verify-payment
    return {"status": "ok"}
