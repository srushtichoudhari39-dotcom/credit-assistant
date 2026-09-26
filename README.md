# Credit Assistant (India Edition 🇮🇳)

**Credit Assistant** is a production-grade, AI-driven financial health web application designed specifically for the **Indian retail financial ecosystem**. It enables users to understand, monitor, and optimize their credit health across standard Indian credit bureau parameters (scale 300 to 900, INR ₹ currency, RBI-aligned DTI benchmarks, and revolving credit utilization).

The platform integrates **Google Gemini AI** to provide step-by-step educational improvement plans without making false promises or unauthorized credit bureau claims.

---

## 📑 Table of Contents

1. [Key Features](#1-key-features)
2. [Indian Credit Context & Educational Disclaimer](#2-indian-credit-context--educational-disclaimer)
3. [Technology Stack](#3-technology-stack)
4. [Architecture & Project Structure](#4-architecture--project-structure)
5. [Implementation of User Scenarios](#5-implementation-of-user-scenarios)
6. [Getting Started & Installation](#6-getting-started--installation)
   * [Prerequisites](#prerequisites)
   * [Backend Setup](#backend-setup)
   * [Frontend Setup](#frontend-setup)
7. [Database Setup & PostgreSQL Migration](#7-database-setup--postgresql-migration)
8. [Google Gemini AI Integration](#8-google-gemini-ai-integration)
9. [Running the Application](#9-running-the-application)
10. [Running Backend Tests](#10-running-backend-tests)
11. [API Reference & Example Requests](#11-api-reference--example-requests)
12. [Security & Compliance Implementation](#12-security--compliance-implementation)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Key Features

* **Authentication & Authorization**: Secure user registration, login, and JWT bearer authentication with bcrypt password hashing (minimum 12 rounds).
* **Automated Financial Calculations**:
  * **Debt-to-Income (DTI) Ratio**: $\text{DTI} = \frac{\text{Total Monthly Debt Payments (EMIs)}}{\text{Gross Monthly Income}} \times 100$
  * **Revolving Credit Utilization**: $\text{Utilization} = \frac{\text{Outstanding Card Balance}}{\text{Total Credit Limit}} \times 100$
  * **Real-time Validation Warnings**: Immediate warning banner if credit card balances exceed total card limit.
* **Interactive Credit Health Dashboard**:
  * Semicircular score gauge dialed to the Indian 300–900 scale with educational tier indicators (*Excellent 750+, Good 700–749, Fair 650–699, Needs Attention <650*).
  * 6 key metric cards with status badges and benchmark comparisons.
  * **Progress Tracking Deltas**: Clearly displays changes since first recorded score (e.g. `+45 points`) and changes in utilization (e.g. `-25 pp`) and debt reduction.
* **4 Financial Visualizations (Chart.js)**:
  1. **Score History Line Chart**: Trajectory over time with bureau threshold guidance zones.
  2. **Utilization Doughnut Chart**: Used revolving card balance vs available credit limit.
  3. **Cashflow Bar Chart**: Gross Income vs Living Expenses, Debt EMIs, and Surplus.
  4. **Financial Bottlenecks Panel**: Actionable remediation steps for missed payments or high DTI.
* **Google Gemini AI Advisor**:
  * Personalized, structured educational consultations.
  * 5-step roadmap containing title, concrete action, rationale in Indian banking context, and realistic timeframe.
  * Explicit stated assumptions and mandatory regulatory disclaimer.
  * Fully functional local fallback engine ensuring zero downtime if an API key is not supplied.
* **Historical Audit Log**:
  * Complete timeline of all financial snapshots recorded during onboarding and periodic updates.
  * Modal to log new monthly scores as reported by bureaus.

---

## 2. Indian Credit Context & Educational Disclaimer

In India, retail credit scores are scored by four RBI-licensed bureaus: **TransUnion CIBIL**, **Experian**, **Equifax**, and **CRIF High Mark**, all utilizing a **300 to 900 point range**.

### Mandatory Educational Notice
> **"Credit Assistant provides educational information based on the data you provide. It does not provide financial, legal, or credit-bureau advice and does not guarantee changes to your credit score. Verify important information with your lender or authorized credit bureau."**

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.10+ / 3.14, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, Bcrypt, HTTPX |
| **Database** | SQLite (development), PostgreSQL compatible via standard SQLAlchemy dialect |
| **AI / LLM** | Google Gemini API (`gemini-1.5-flash`), structured prompt & JSON schema |
| **Frontend** | React 18, Vite, React Router v6, Axios, Chart.js, react-chartjs-2, Lucide React |
| **Styling** | Custom Responsive Fintech Design System (CSS Variables, Flexbox, CSS Grid) |
| **Testing** | FastAPI TestClient, SQLite test runner |

---

## 4. Architecture & Project Structure

```
credit-assistant/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── dependencies.py       # get_current_user HTTPBearer dependency
│   │   │   ├── jwt.py                # JWT creation and decoding
│   │   │   └── passwords.py          # Bcrypt hashing & verification
│   │   ├── models/
│   │   │   ├── ai_consultation.py    # AIConsultation history model
│   │   │   ├── credit_history.py     # CreditHistory milestone model
│   │   │   ├── financial_profile.py  # FinancialProfile model
│   │   │   └── user.py               # User model with cascade relationships
│   │   ├── routes/
│   │   │   ├── ai.py                 # POST /api/ai/advice, GET /api/ai/history
│   │   │   ├── auth.py               # POST /api/auth/register, /login, GET /me
│   │   │   ├── credit_history.py     # GET /api/credit-history, POST new entry
│   │   │   ├── dashboard.py          # GET /api/dashboard aggregate
│   │   │   └── financial_profile.py  # GET, POST, PUT /api/financial-profile
│   │   ├── schemas/
│   │   │   ├── ai.py                 # AIConsultation Pydantic models
│   │   │   ├── auth.py               # Auth request/response schemas
│   │   │   ├── credit_history.py     # Credit history schemas
│   │   │   ├── dashboard.py          # Dashboard aggregated schema & deltas
│   │   │   └── financial_profile.py  # FinancialProfile input validation & warning
│   │   ├── services/
│   │   │   ├── calculations.py       # DTI, utilization, bottlenecks & deltas
│   │   │   └── gemini_service.py     # Gemini client with prompt & local fallback
│   │   ├── utils/
│   │   │   └── constants.py          # Indian thresholds, status bands & disclaimer
│   │   ├── database.py               # SQLAlchemy engine & sessionmaker
│   │   └── main.py                   # FastAPI entrypoint & CORS middleware
│   ├── tests/
│   │   ├── conftest.py               # Pytest setup & test client fixture
│   │   ├── test_ai.py                # AI consultation endpoint tests
│   │   ├── test_auth.py              # Register, login, token tests
│   │   ├── test_calculations.py      # DTI, utilization, zero-div, threshold tests
│   │   ├── test_credit_history.py    # Historical tracking & delta tests
│   │   ├── test_dashboard.py         # Dashboard aggregate & delta tests
│   │   └── test_financial_profile.py # Profile validations & limit warnings
│   ├── .env.example
│   ├── requirements.txt
│   ├── run_tests.py                  # Standalone test runner (14 passed test suite)
│   └── seed_demo_data.py             # Demo account seeder
│
├── frontend/
│   ├── src/
│   │   ├── charts/
│   │   │   ├── IncomeExpenseChart.jsx  # Cashflow bar chart
│   │   │   ├── ScoreHistoryChart.jsx   # Score trajectory line chart
│   │   │   └── UtilizationChart.jsx    # Card utilization doughnut chart
│   │   ├── components/
│   │   │   ├── AIAdvisorModal.jsx      # Gemini consultation modal & 5-step roadmap
│   │   │   ├── CreditScoreGauge.jsx    # Semicircular score dial (300-900)
│   │   │   ├── Footer.jsx              # Regulatory transparency footer
│   │   │   ├── MetricCard.jsx          # Reusable financial indicator card
│   │   │   └── Navbar.jsx              # Navigation bar & global AI trigger
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # React auth context & token management
│   │   ├── pages/
│   │   │   ├── CreditHistoryPage.jsx   # Timeline & audit log table
│   │   │   ├── DashboardPage.jsx       # Main interactive dashboard
│   │   │   ├── FinancialProfilePage.jsx# Profile setup with live calculator
│   │   │   ├── LandingPage.jsx         # Fintech landing page
│   │   │   ├── LoginPage.jsx           # Sign in with 1-click demo button
│   │   │   └── RegisterPage.jsx        # Account registration
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT interceptor
│   │   ├── App.jsx                     # Route declarations & auth guard
│   │   ├── index.css                   # Fintech design system CSS
│   │   └── main.jsx                    # Vite React DOM root
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## 5. Implementation of User Scenarios

### Scenario 1 — User Onboarding & Initial Assessment
1. User enters name, email, and password on `/register`. Passwords are encrypted using bcrypt.
2. User is redirected to `/profile` (Onboarding mode).
3. As the user enters their income, EMI, credit limit, and balance, the interface dynamically displays live DTI and Utilization percentages with color-coded badges before saving.
4. On submission (`POST /api/financial-profile`), the backend validates that score $\in [300, 900]$, enforces non-negative inputs, checks if balance exceeds limit, calculates DTI and utilization, stores the `FinancialProfile`, and automatically archives the first baseline snapshot into `CreditHistory`.
5. User is redirected to `/dashboard` displaying their initial standing.

### Scenario 2 — AI Financial Consultation
1. User clicks **"Ask AI Advisor"** from the Dashboard or Navigation bar.
2. Frontend triggers `POST /api/ai/advice` with the active financial snapshot.
3. Backend formats a structured prompt enforcing Indian context, educational disclaimer, and strict compliance rules (no false guarantees, no pretending to be a credit bureau).
4. Google Gemini generates structured JSON with:
   * Executive summary of current credit health
   * Identified bottlenecks (e.g. 70% card utilization, 1 missed payment)
   * 4 key recommendations
   * **5-step roadmap**: Action items across days 1–7, month 1, months 2–3, months 4–6, and ongoing
   * Stated assumptions & mandatory legal disclaimer.
5. The consultation is persisted in the `AIConsultation` database table and rendered in a modal.

### Scenario 3 — Progress Tracking
1. When a user logs in after multiple months, the dashboard fetches all historical records.
2. The system compares the latest snapshot against the earliest recorded snapshot:
   * Example: Initial score: 680, Current score: 742 $\rightarrow$ Displayed as: **"Change since your first recorded score: +62 points"**.
   * Note: The UI attributes this to user-reported records without claiming AI causation.
   * Also computes deltas for utilization (`-37 pp`), total debt (`-₹70,000`), and DTI (`-7.3 pp`).

### Scenario 4 — Real-Time Credit Health Monitoring
1. When user updates their numbers on `/profile` (`PUT /api/financial-profile`):
   * Backend recalculates DTI and utilization.
   * Saves updated `FinancialProfile`.
   * Automatically creates a new historical snapshot in `CreditHistory`.
   * Calculates immediate delta from previous record (e.g. "Previous utilization: 70%, New: 45% $\rightarrow$ Utilization change: -25 percentage points").
   * Updates all 4 charts immediately.

---

## 6. Getting Started & Installation

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: v18+ and `npm`

---

### Backend Setup

1. Open a terminal in `credit-assistant/backend`:
   ```bash
   cd credit-assistant/backend
   ```
2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with the pre-configured demo user (Arjun Verma):
   ```bash
   python seed_demo_data.py
   ```

---

### Frontend Setup

1. Open a separate terminal in `credit-assistant/frontend`:
   ```bash
   cd credit-assistant/frontend
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## 7. Database Setup & PostgreSQL Migration

By default, the application runs on SQLite (`sqlite:///./credit_assistant.db`), requiring zero database installation.

### Switching to PostgreSQL for Production
The application was written with pure SQLAlchemy ORM models compatible with PostgreSQL without code changes.

1. In `backend/.env`, update `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/credit_assistant
   ```
2. Install the PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```
3. When FastAPI launches, `Base.metadata.create_all(bind=engine)` will automatically generate all tables in PostgreSQL.

---

## 8. Google Gemini AI Integration

1. Get a free API key from **[Google AI Studio](https://aistudio.google.com/)**.
2. Open `backend/.env` and insert your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_gemini_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. **Graceful Fallback**: If `GEMINI_API_KEY` is empty, the application uses an internal deterministic advisory engine that produces the exact same structured schema, ensuring 100% test pass rate and uninterrupted local evaluation!

---

## 9. Running the Application

### Start the Backend
From `credit-assistant/backend`:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend runs at: **http://127.0.0.1:8000**
* Interactive Swagger API Docs: **http://127.0.0.1:8000/docs**
* Health Check: **http://127.0.0.1:8000/api/health**

### Start the Frontend
From `credit-assistant/frontend`:
```bash
npm run dev
```
* Frontend runs at: **http://127.0.0.1:5173**

### Test Account Credentials
You can register a new account or click the **"Fill Demo Account (Arjun Verma)"** button on the Login page:
* **Email**: `arjun.verma@example.com`
* **Password**: `Password123!`

---

## 10. Running Backend Tests

The project includes unit and integration tests covering Authentication, DTI, Utilization, Validations, Baseline Deltas, History, and AI Consultation.

Run the test suite from `credit-assistant/backend`:
```bash
python run_tests.py
```

### Test Output:
```
==========================================
      RUNNING CREDIT ASSISTANT TEST SUITE 
==========================================

Running: DTI Calculations ... [PASS]
Running: Credit Utilization Calculations ... [PASS]
Running: Educational Status Thresholds ... [PASS]
Running: Bottlenecks & Deltas ... [PASS]
Running: Auth Registration ... [PASS]
Running: Auth Duplicate Email Rejection ... [PASS]
Running: Auth Login ... [PASS]
Running: Auth Current User /me ... [PASS]
Running: Financial Profile Creation (Onboarding) ... [PASS]
Running: Financial Profile Validations ... [PASS]
Running: Financial Profile Update (Monitoring) ... [PASS]
Running: Dashboard API & Progress Deltas ... [PASS]
Running: Credit History Tracking & Wording ... [PASS]
Running: AI Advisor Consultation & Roadmap ... [PASS]

==========================================
Results: 14 passed, 0 failed in 0.95s
==========================================
```

---

## 11. API Reference & Example Requests

### 1. Register User
`POST /api/auth/register`
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "password": "SecurePassword123!"
}
```
**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "has_profile": false
  }
}
```

### 2. Login
`POST /api/auth/login`
```json
{
  "email": "priya.sharma@example.com",
  "password": "SecurePassword123!"
}
```

### 3. Create Financial Profile (Onboarding)
`POST /api/financial-profile`
*Headers: `Authorization: Bearer <TOKEN>`*
```json
{
  "credit_score": 680,
  "monthly_income": 50000.0,
  "monthly_expenses": 30000.0,
  "total_debt": 250000.0,
  "monthly_debt_payment": 15000.0,
  "credit_limit": 100000.0,
  "credit_balance": 70000.0,
  "missed_payments": 1,
  "active_loans": 2,
  "existing_credit_cards": 2,
  "loan_types": "Personal Loan, Two-Wheeler Loan"
}
```
**Response (201 Created):**
```json
{
  "credit_score": 680,
  "dti_ratio": 30.0,
  "credit_utilization": 70.0,
  "score_status": {
    "status": "Fair",
    "tier": "fair",
    "color": "#F59E0B"
  },
  "dti_status": {
    "status": "Healthy",
    "tier": "healthy",
    "color": "#10B981"
  },
  "utilization_status": {
    "status": "High",
    "tier": "high",
    "color": "#EF4444"
  },
  "validation_warning": null
}
```

### 4. Fetch Dashboard Aggregates
`GET /api/dashboard`
*Headers: `Authorization: Bearer <TOKEN>`*
Returns current profile, baseline deltas (`first_record_delta`, `previous_record_delta`), score history array for line charts, bottlenecks list, and the educational disclaimer.

### 5. Request AI Financial Consultation
`POST /api/ai/advice`
*Headers: `Authorization: Bearer <TOKEN>`*
```json
{
  "additional_notes": "Planning to apply for a Home Loan in 12 months."
}
```
**Response (200 OK):**
```json
{
  "summary": "Your reported credit utilization is relatively high at 70.0%...",
  "credit_health_status": "Fair with Optimization Potential",
  "bottlenecks": [
    "High utilization at 70.0%",
    "Existing monthly debt obligations (DTI 30%)",
    "1 recent missed payment recorded"
  ],
  "recommendations": [
    "Prioritize 100% on-time payments for active loans via automated NACH e-mandates.",
    "Lower card balance from ₹70,000 towards <= 30% of total limit."
  ],
  "five_step_roadmap": [
    {
      "step_number": 1,
      "title": "Audit and Settle Past-Due Balances",
      "action": "Clear overdue charges or pending minimums immediately.",
      "rationale": "Timely payment history accounts for ~35% of an Indian credit score.",
      "timeframe": "Immediate (Days 1–7)"
    },
    {
      "step_number": 2,
      "title": "Establish Automated Bill Mandates",
      "action": "Configure auto-debit (NACH or net-banking e-mandates).",
      "rationale": "Prevents inadvertent late payment entries.",
      "timeframe": "Week 2"
    },
    {
      "step_number": 3,
      "title": "Tackle Revolving Card Utilization",
      "action": "Structure repayment to lower card balance under 30%.",
      "rationale": "High utilization signals heavy credit dependency.",
      "timeframe": "Months 1–3"
    },
    {
      "step_number": 4,
      "title": "Debt Prepayment Review",
      "action": "Allocate surplus monthly cash flow towards highest interest obligation.",
      "rationale": "Directly reduces Debt-to-Income (DTI) ratio.",
      "timeframe": "Months 3–6"
    },
    {
      "step_number": 5,
      "title": "Ongoing Monitoring & Bureau Verification",
      "action": "Check credit statements periodically and avoid hard inquiries.",
      "rationale": "Consistent payment discipline builds prime standing.",
      "timeframe": "Ongoing (6+ Months)"
    }
  ],
  "assumptions": [
    "User-reported monthly income of ₹50,000 is steady.",
    "Reported card limit and balance reflect all active cards."
  ],
  "disclaimer": "Credit Assistant provides educational information based on the data you provide..."
}
```

---

## 12. Security & Compliance Implementation

1. **Password Hashing**: Bcrypt with salted rounds; plain text passwords never stored or logged.
2. **JWT Authentication**: HS256 tokens carrying user subject ID with expiration time validation.
3. **Frontend API Protection**: Google Gemini API key is stored exclusively on the backend (`.env`). The frontend never has direct access to Gemini secrets.
4. **SQL Injection Protection**: All queries utilize SQLAlchemy ORM parameterized queries.
5. **CORS Whitelisting**: Restricted to designated origins via FastAPI middleware.
6. **Input Sanitization**: Pydantic schema validation enforces constraints (e.g. Credit score 300–900, non-negative amounts, email format).
7. **Compliance Guarantees**: Does not claim official bureau authority, does not guarantee future score changes, and clearly labels all thresholds as educational indicators.

---

## 13. Future Enhancements

* **Official Bureau APIs**: Integrate authorized CRIF High Mark or Experian APIs for one-click report fetch with consent.
* **Account Aggregator (AA) Integration**: Connect with RBI Account Aggregators (e.g. Setu, Finvu) for real-time bank statement synchronization.
* **Automated NACH & EMI Reminders**: WhatsApp / SMS alerts before EMI due dates.
* **Multilingual UI**: Support for Hindi, Tamil, Telugu, Marathi, and Bengali.
* **Mobile Application**: React Native mobile app for iOS and Android.

---

## 📄 License
This project is open-source and intended for educational and portfolio demonstration purposes.
