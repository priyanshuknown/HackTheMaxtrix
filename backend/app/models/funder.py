import uuid
import json
from datetime import datetime

from sqlalchemy import String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Funder(Base):
    """Funders table — institutional funders only (Core Rule 4).
    Each funder is a CSR program, alumni association, or college welfare office."""

    __tablename__ = "funders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )
    org_name: Mapped[str] = mapped_column(String(255), nullable=False)
    funder_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # 'csr_program', 'alumni_association', 'college_welfare'

    categories_supported_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    @property
    def categories_supported(self):
        try:
            return json.loads(self.categories_supported_json)
        except (json.JSONDecodeError, TypeError):
            return []

    @categories_supported.setter
    def categories_supported(self, value):
        self.categories_supported_json = json.dumps(value) if value else "[]"

    available_balance: Mapped[int] = mapped_column(Integer, default=0)
    avg_payout_days: Mapped[float] = mapped_column(Float, default=3.0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="funder")
    matches: Mapped[list["Match"]] = relationship("Match", back_populates="funder")
