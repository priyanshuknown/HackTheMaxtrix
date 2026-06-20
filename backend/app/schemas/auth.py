from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    funder = "funder"
    admin = "admin"


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole

    # Student-specific fields (required if role == student)
    institution: str | None = None
    enrollment_id: str | None = None

    # Funder-specific fields (required if role == funder)
    org_name: str | None = None
    funder_type: str | None = None
    categories_supported: list[str] | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str

    model_config = {"from_attributes": True}
