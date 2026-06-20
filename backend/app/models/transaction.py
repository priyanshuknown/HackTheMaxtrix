import uuid
from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Transaction(Base):
    """Transactions table — Razorpay payment records for approved matches."""

    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    match_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matches.id"), unique=True, nullable=False
    )
    razorpay_order_id: Mapped[str] = mapped_column(String(255), nullable=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String(255), nullable=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # 'pending', 'funded', 'failed'
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="transaction")
    impact_log: Mapped["ImpactLog"] = relationship(
        "ImpactLog", back_populates="transaction", uselist=False
    )
