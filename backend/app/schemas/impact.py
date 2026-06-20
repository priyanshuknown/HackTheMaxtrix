from pydantic import BaseModel


class VerificationResult(BaseModel):
    verification_score: int
    flags: list[str]


class UrgencyResult(BaseModel):
    urgency_level: str
    urgency_score: float
    review_flag: bool


class DisburseRequest(BaseModel):
    match_id: str


class DisburseResponse(BaseModel):
    transaction_id: str
    razorpay_order_id: str
    amount: int
    currency: str = "INR"
    key_id: str


class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class ImpactReportResponse(BaseModel):
    id: str
    report_url: str
    funder_name: str
    amount: int
    category: str
    outcome: str | None = None
    generated_at: str
    model_config = {"from_attributes": True}
