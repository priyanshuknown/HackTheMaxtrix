import uuid
from datetime import datetime, date
from typing import Optional
import json
from sqlalchemy import (
    String,
    Integer,
    Text,
    Date,
    Boolean,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FundingRequest(Base):
    """Requests table — student funding requests with CHECK(amount >= 2000)
    and category validation. This is the heart of Core Rules 1 & 2."""

    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id"), nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # 'exam_fee', 'certification_fee', 'device_repair', 'interview_travel'
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    deadline_date: Mapped[date] = mapped_column(Date, nullable=False)
    document_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Verification fields
    verification_score: Mapped[int] = mapped_column(Integer, nullable=True)
    verification_flags_json: Mapped[str] = mapped_column(
        Text, nullable=True, default="[]"
    )

    @property
    def verification_flags(self):
        if self.verification_flags_json:
            try:
                return json.loads(self.verification_flags_json)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    @verification_flags.setter
    def verification_flags(self, value):
        self.verification_flags_json = json.dumps(value) if value else "[]"

    # Urgency fields
    urgency_level: Mapped[str] = mapped_column(String(10), nullable=True)
    review_flag: Mapped[bool] = mapped_column(Boolean, default=False)

    # Status tracking
    status: Mapped[str] = mapped_column(String(20), default="submitted")
    academic_year: Mapped[str] = mapped_column(String(10), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (
        # CORE RULE 1: Database-level enforcement of Rs.2000 minimum
        CheckConstraint("amount >= 2000", name="chk_min_amount_2000"),
    )

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="requests")
    matches: Mapped[list["Match"]] = relationship("Match", back_populates="request")
