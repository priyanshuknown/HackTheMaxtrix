import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Match(Base):
    """Matches table — links a verified request to a ranked funder."""

    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("requests.id"), nullable=False
    )
    funder_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("funders.id"), nullable=False
    )
    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="proposed"
    )  # 'proposed', 'accepted', 'rejected'
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    request: Mapped["FundingRequest"] = relationship(
        "FundingRequest", back_populates="matches"
    )
    funder: Mapped["Funder"] = relationship("Funder", back_populates="matches")
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="match", uselist=False
    )
