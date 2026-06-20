from pydantic import BaseModel, Field, field_validator
from datetime import date
from enum import Enum


class RequestCategory(str, Enum):
    """Fixed categories — Core Rule 2. No 'other' option."""
    exam_fee = "exam_fee"
    certification_fee = "certification_fee"
    device_repair = "device_repair"
    interview_travel = "interview_travel"


class CreateFundingRequest(BaseModel):
    """Schema for creating a new funding request.
    Enforces Core Rule 1 (amount >= 2000) and Core Rule 2 (fixed categories)
    at the API validation level."""

    category: RequestCategory
    amount: int = Field(..., ge=2000, description="Minimum Rs. 2,000")
    description: str = Field(..., min_length=10, max_length=1000)
    deadline_date: date

    @field_validator("amount")
    @classmethod
    def validate_minimum_amount(cls, v):
        if v < 2000:
            raise ValueError(
                "Minimum funding request is Rs. 2,000. "
                "Smaller requests create dependency patterns that undermine "
                "the platform's mission as an emergency resource."
            )
        return v

    @field_validator("deadline_date")
    @classmethod
    def validate_deadline_future(cls, v):
        if v <= date.today():
            raise ValueError("Deadline must be a future date.")
        return v


class FundingRequestResponse(BaseModel):
    id: str
    student_id: str
    category: str
    amount: int
    description: str
    deadline_date: str
    document_url: str | None = None
    verification_score: int | None = None
    verification_flags: list | None = None
    urgency_level: str | None = None
    review_flag: bool = False
    status: str
    academic_year: str
    created_at: str
    model_config = {"from_attributes": True}

class FundingRequestListItem(BaseModel):
    """Anonymized view for funder dashboard — no student identity."""
    id: str
    category: str
    amount: int
    description: str
    deadline_date: str
    verification_score: int | None = None
    urgency_level: str | None = None
    status: str
    created_at: str
    model_config = {"from_attributes": True}
