import uuid
from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Student(Base):
    """Students table — links to user, tracks enrollment and request frequency."""

    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=False
    )
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    enrollment_id: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    academic_year: Mapped[str] = mapped_column(String(10), nullable=False)
    request_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("request_count >= 0", name="chk_request_count_positive"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="student")
    requests: Mapped[list["FundingRequest"]] = relationship(
        "FundingRequest", back_populates="student"
    )
