"""Seed Data Script — populates the database with mock institutional funders
and student requests for demo purposes.

All funders are INSTITUTIONAL (Core Rule 4).
All request amounts are >= Rs.2,000 (Core Rule 1).
All categories are from the fixed set (Core Rule 2).
"""

import asyncio
import uuid
from datetime import datetime, date, timedelta

from app.database import async_session, init_db
from app.models.user import User
from app.models.student import Student
from app.models.funder import Funder
from app.models.request import FundingRequest
from app.services.auth_service import hash_password


def _academic_year():
    now = datetime.utcnow()
    if now.month >= 6:
        return f"{now.year}-{str(now.year + 1)[-2:]}"
    return f"{now.year - 1}-{str(now.year)[-2:]}"


# ──── MOCK FUNDERS (8 institutional — never individual donors) ────
MOCK_FUNDERS = [
    {"org_name": "Tata CSR Education Fund", "funder_type": "csr_program",
     "categories": ["exam_fee", "certification_fee", "device_repair", "interview_travel"],
     "balance": 500000, "speed": 2.0},
    {"org_name": "IIT Bombay Alumni Association", "funder_type": "alumni_association",
     "categories": ["exam_fee", "certification_fee"], "balance": 300000, "speed": 3.5},
    {"org_name": "Delhi University Welfare Office", "funder_type": "college_welfare",
     "categories": ["exam_fee", "certification_fee", "device_repair", "interview_travel"],
     "balance": 200000, "speed": 4.0},
    {"org_name": "Infosys Foundation CSR", "funder_type": "csr_program",
     "categories": ["certification_fee", "device_repair"], "balance": 750000, "speed": 1.5},
    {"org_name": "BITS Pilani Alumni Fund", "funder_type": "alumni_association",
     "categories": ["interview_travel", "exam_fee"], "balance": 400000, "speed": 2.5},
    {"org_name": "Wipro CSR Education Wing", "funder_type": "csr_program",
     "categories": ["exam_fee", "certification_fee", "device_repair", "interview_travel"],
     "balance": 600000, "speed": 2.0},
    {"org_name": "Anna University Student Welfare", "funder_type": "college_welfare",
     "categories": ["exam_fee", "device_repair"], "balance": 150000, "speed": 5.0},
    {"org_name": "HCL Foundation Education", "funder_type": "csr_program",
     "categories": ["certification_fee", "interview_travel"], "balance": 350000, "speed": 3.0},
]

# ──── MOCK STUDENTS + REQUESTS (all >= Rs.2000, fixed categories) ────
MOCK_STUDENTS = [
    {"name": "Aarav Sharma", "email": "aarav@student.edu", "inst": "IIT Delhi", "eid": "IIT2024001"},
    {"name": "Priya Patel", "email": "priya@student.edu", "inst": "NIT Trichy", "eid": "NIT2024002"},
    {"name": "Rohan Kumar", "email": "rohan@student.edu", "inst": "BITS Pilani", "eid": "BITS2024003"},
    {"name": "Ananya Gupta", "email": "ananya@student.edu", "inst": "Delhi University", "eid": "DU2024004"},
    {"name": "Vikram Singh", "email": "vikram@student.edu", "inst": "Anna University", "eid": "AU2024005"},
    {"name": "Neha Reddy", "email": "neha@student.edu", "inst": "IIT Bombay", "eid": "IITB2024006"},
    {"name": "Arjun Nair", "email": "arjun@student.edu", "inst": "VIT Vellore", "eid": "VIT2024007"},
    {"name": "Kavya Iyer", "email": "kavya@student.edu", "inst": "IIIT Hyderabad", "eid": "IIIT2024008"},
]

MOCK_REQUESTS = [
    {"student_idx": 0, "cat": "exam_fee", "amount": 5000, "days": 5,
     "desc": "GATE 2026 registration fee — deadline approaching for CS paper"},
    {"student_idx": 1, "cat": "certification_fee", "amount": 8500, "days": 12,
     "desc": "AWS Cloud Practitioner certification needed for placement season"},
    {"student_idx": 2, "cat": "device_repair", "amount": 12000, "days": 7,
     "desc": "Laptop screen replacement — needed for final year project submission"},
    {"student_idx": 3, "cat": "interview_travel", "amount": 3500, "days": 3,
     "desc": "Train ticket Delhi to Bangalore for on-campus interview at startup"},
    {"student_idx": 4, "cat": "exam_fee", "amount": 2500, "days": 10,
     "desc": "University semester exam fee — last date for payment next week"},
    {"student_idx": 5, "cat": "certification_fee", "amount": 15000, "days": 20,
     "desc": "Google Cloud Professional certification for campus placement preparation"},
    {"student_idx": 6, "cat": "interview_travel", "amount": 4500, "days": 4,
     "desc": "Flight booking for walk-in interview at TCS Mumbai office"},
    {"student_idx": 7, "cat": "device_repair", "amount": 6000, "days": 8,
     "desc": "Tablet digitizer repair — essential for note-taking in architecture course"},
    {"student_idx": 0, "cat": "certification_fee", "amount": 9000, "days": 15,
     "desc": "Microsoft Azure Fundamentals certification for internship requirement"},
    {"student_idx": 1, "cat": "exam_fee", "amount": 3000, "days": 6,
     "desc": "CAT 2026 exam registration — MBA entrance exam deadline soon"},
    {"student_idx": 2, "cat": "interview_travel", "amount": 7000, "days": 2,
     "desc": "Urgent travel to Hyderabad for final round interview at tech company"},
    {"student_idx": 3, "cat": "device_repair", "amount": 4000, "days": 9,
     "desc": "Keyboard replacement for MacBook — needed for coding assignments"},
    {"student_idx": 4, "cat": "certification_fee", "amount": 11000, "days": 25,
     "desc": "Cisco CCNA networking certification for campus recruitment eligibility"},
]


async def seed():
    """Run the seed script."""
    # Import all models so tables are created
    from app.models import (User, Student, FundingRequest, Funder,
                            Match, Transaction, ImpactLog)
    await init_db()

    async with async_session() as session:
        # Check if data already seeded
        from sqlalchemy import select, func
        count = await session.execute(select(func.count(User.id)))
        if count.scalar() > 0:
            print("Database already seeded. Skipping.")
            return

        pwd = hash_password("demo123")
        ay = _academic_year()

        # ──── Create admin user ────
        admin = User(email="admin@vidyafund.ai", password_hash=pwd,
                     full_name="VidyaFund Admin", role="admin")
        session.add(admin)

        # ──── Create funder users + profiles ────
        funder_records = []
        for i, f in enumerate(MOCK_FUNDERS):
            user = User(email=f"funder{i+1}@vidyafund.ai", password_hash=pwd,
                        full_name=f"{f['org_name']} Admin", role="funder")
            session.add(user)
            await session.flush()
            import json as _json
            funder = Funder(user_id=user.id, org_name=f["org_name"],
                           funder_type=f["funder_type"],
                           categories_supported_json=_json.dumps(f["categories"]),
                           available_balance=f["balance"],
                           avg_payout_days=f["speed"])
            session.add(funder)
            funder_records.append(funder)

        # ──── Create student users + profiles ────
        student_records = []
        for s in MOCK_STUDENTS:
            user = User(email=s["email"], password_hash=pwd,
                        full_name=s["name"], role="student")
            session.add(user)
            await session.flush()
            student = Student(user_id=user.id, institution=s["inst"],
                             enrollment_id=s["eid"], academic_year=ay)
            session.add(student)
            student_records.append(student)

        await session.flush()

        # ──── Create mock requests ────
        for r in MOCK_REQUESTS:
            student = student_records[r["student_idx"]]
            deadline = date.today() + timedelta(days=r["days"])
            req = FundingRequest(
                student_id=student.id, category=r["cat"], amount=r["amount"],
                description=r["desc"], deadline_date=deadline,
                academic_year=ay, status="submitted",
            )
            session.add(req)
            student.request_count += 1

        await session.commit()
        print(f"✅ Seeded: 1 admin, {len(MOCK_FUNDERS)} funders, "
              f"{len(MOCK_STUDENTS)} students, {len(MOCK_REQUESTS)} requests")
        print(f"   Academic year: {ay}")
        print(f"   Login: any email above with password 'demo123'")
        print(f"   Admin: admin@vidyafund.ai / demo123")


if __name__ == "__main__":
    asyncio.run(seed())
