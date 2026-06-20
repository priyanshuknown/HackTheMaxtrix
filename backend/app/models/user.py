import uuid
from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """Users table — stores auth credentials and role for all platform users."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # 'student', 'funder', 'admin'
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    student: Mapped["Student"] = relationship(
        "Student", back_populates="user", uselist=False
    )
    funder: Mapped["Funder"] = relationship(
        "Funder", back_populates="user", uselist=False
    )
