import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ImpactLog(Base):
    """Impact logs table — stores generated PDF report metadata."""

    __tablename__ = "impact_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id"), unique=True, nullable=False
    )
    report_url: Mapped[str] = mapped_column(String(500), nullable=False)
    funder_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    outcome: Mapped[str] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="impact_log"
    )
