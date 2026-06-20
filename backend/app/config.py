from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./vidyafund.db"

    # JWT
    JWT_SECRET: str = "vidyafund-hackathon-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"

    # File paths
    UPLOAD_DIR: str = "../uploads"
    REPORTS_DIR: str = "../reports"

    # Core business rules
    MIN_REQUEST_AMOUNT: int = 2000
    MAX_REQUESTS_PER_YEAR: int = 2
    ALLOWED_CATEGORIES: list[str] = [
        "exam_fee",
        "certification_fee",
        "device_repair",
        "interview_travel",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

# Ensure upload and reports directories exist
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.REPORTS_DIR).mkdir(parents=True, exist_ok=True)
