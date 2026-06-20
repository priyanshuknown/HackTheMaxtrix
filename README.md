# VidyaFund AI

> **Institutional Student-Funding Routing Platform**
> Smart verification, urgency scoring, and institutional matching — zero dependency, zero crowdfunding.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4+-06B6D4?logo=tailwindcss&logoColor=white)

---

## 🎯 What is VidyaFund AI?

VidyaFund AI is **not** a crowdfunding platform. It's an **institutional routing engine** that connects verified student needs with registered institutional funders (CSR programs, alumni associations, college welfare offices) through AI-powered verification, urgency scoring, and smart matching.

### Core Philosophy: Prevent Dependency, Enable Emergency Support

| Rule | Enforcement | Why |
|------|------------|-----|
| **₹2,000 Minimum** | DB CHECK + API + Frontend validation | Small requests (₹100-₹1000) create dependency patterns where students treat the platform as a routine safety net |
| **Fixed Categories Only** | ENUM type at all layers | `exam_fee`, `certification_fee`, `device_repair`, `interview_travel` — no vague "other" field |
| **1-2 Requests/Year** | DB count check before insert | Prevents habitual usage; this is for emergencies, not recurring needs |
| **Institutional Funding Only** | No individual donor UI/API/DB support | Every funder is an institution — never an individual stranger |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Tailwind Frontend                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ Student Form  │  │ Funder Dashboard  │  │Status Tracker │ │
│  │ (Multi-step)  │  │ (Anon. Cards)     │  │ (Timeline)    │ │
│  └──────┬───────┘  └────────┬─────────┘  └──────┬────────┘ │
└─────────┼──────────────────┼────────────────────┼───────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (JWT Auth)                 │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐  │
│  │Verification│ │  Urgency   │ │ Matching │ │  Impact   │  │
│  │   Agent    │ │  Engine    │ │  Engine  │ │  Agent    │  │
│  │(OCR+GPT)  │ │(Rule-based)│ │(Scoring) │ │(ReportLab)│  │
│  └────────────┘ └────────────┘ └──────────┘ └───────────┘  │
│                                                              │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │  Razorpay Test   │  │     PostgreSQL Database          │  │
│  │  (Full amount,   │  │  (CHECK amount>=2000, ENUMs,     │  │
│  │   1 transaction) │  │   freq cap enforcement)          │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | SPA with multi-step forms |
| Styling | Tailwind CSS v4 | Indigo-themed card-based UI |
| Backend | FastAPI + Pydantic v2 | Async API with validation |
| Database | PostgreSQL + SQLAlchemy 2.0 | Async via asyncpg |
| Auth | JWT (PyJWT) | Role-based (student/funder/admin) |
| OCR | Tesseract (pytesseract) | Document text extraction |
| AI | GPT-4o-mini (OpenAI) | Verification scoring |
| Payments | Razorpay Test Mode | Single full-amount transactions |
| Reports | ReportLab | Impact PDF generation |

---

## 📁 Project Structure

```
HACKTHEMATRIX/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry + CORS
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # Async engine + sessions
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response
│   │   ├── api/                 # Route handlers
│   │   ├── services/            # Business logic + AI agents
│   │   └── middleware/          # JWT auth
│   ├── seed.py                  # Mock data population
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/               # Login, Register, Request, Dashboard, Status
│   │   ├── components/          # Navbar, Cards, Timeline, FileUpload
│   │   ├── context/             # Auth context
│   │   └── api/                 # Axios client
│   ├── package.json
│   └── vite.config.js
├── reports/                     # Generated impact PDFs
├── uploads/                     # Uploaded verification docs
├── docker-compose.yml           # PostgreSQL container
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL) or local PostgreSQL 16+
- (Optional) Tesseract OCR installed

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Edit with your keys
python -m app.main           # Runs on http://localhost:8000
```

### 3. Seed Data
```bash
cd backend
python seed.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev                  # Runs on http://localhost:5173
```

---

## 🔄 Demo Flow (< 5 minutes)

1. **Rejection Demo** — Enter ₹500 in request form → See inline validation blocking submission
2. **Submit Request** — Student submits ₹5,000 exam fee request with document
3. **AI Verification** — Tesseract OCR + GPT-4o-mini scores document authenticity
4. **Urgency Scoring** — Engine calculates urgency based on deadline + category
5. **Smart Matching** — Algorithm ranks institutional funders by fit
6. **Funder Approval** — Funder sees anonymous card, clicks "Approve Funding"
7. **Razorpay Payment** — Test mode checkout for full amount in one transaction
8. **Impact Report** — PDF generated with anonymized outcome data

---

## 📊 Database Schema

### Core Tables
- **users** — Auth credentials + role (student/funder/admin)
- **students** — Enrollment info + request count per academic year
- **requests** — Funding requests with `CHECK (amount >= 2000)` and category ENUM
- **funders** — Institutional profiles with supported categories + balance
- **matches** — Request-funder pairings with match scores
- **transactions** — Razorpay payment records
- **impact_logs** — Generated report URLs + anonymized outcome data

### Key Constraints
```sql
-- Core Rule 1: Minimum threshold
ALTER TABLE requests ADD CONSTRAINT chk_min_amount CHECK (amount >= 2000);

-- Core Rule 2: Fixed categories
CREATE TYPE request_category AS ENUM (
    'exam_fee', 'certification_fee', 'device_repair', 'interview_travel'
);

-- Core Rule 4: Institutional only
CREATE TYPE funder_type AS ENUM (
    'csr_program', 'alumni_association', 'college_welfare'
);
```

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/auth/register` | Public | Register with role |
| POST | `/auth/login` | Public | Get JWT token |
| POST | `/requests` | Student | Submit request (validates all 4 rules) |
| GET | `/requests/{id}` | Auth | Get request details |
| POST | `/verify/{id}` | Admin | Trigger AI verification |
| GET | `/match/{id}` | Admin | Run matching engine |
| POST | `/disburse/{id}` | Funder | Approve + create Razorpay order |
| GET | `/impact/{id}` | Auth | Get/generate impact report |
| POST | `/webhooks/razorpay` | Public | Payment status webhook |

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://vidyafund:vidyafund@localhost:5432/vidyafund

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# OpenAI (for verification agent)
OPENAI_API_KEY=sk-your-key-here

# Razorpay Test Mode
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# App
UPLOAD_DIR=../uploads
REPORTS_DIR=../reports
```

---

## 📜 License

Built for HackTheMatrix hackathon. All rights reserved.
