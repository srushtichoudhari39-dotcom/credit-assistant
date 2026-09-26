"""
Comprehensive test runner for Credit Assistant backend.
Runs all unit and integration tests using FastAPI TestClient and isolated in-memory/test SQLite DB.
"""
import sys
import os
import time
import traceback
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, get_db
from app.main import app
from app.services.calculations import (
    calculate_dti,
    calculate_credit_utilization,
    identify_bottlenecks,
    calculate_metric_deltas
)
from app.utils.constants import (
    get_credit_score_status,
    get_dti_status,
    get_utilization_status,
    MANDATORY_DISCLAIMER
)

# Test DB Setup
TEST_DB_FILE = "./test_runner_credit.db"
if os.path.exists(TEST_DB_FILE):
    try:
        os.remove(TEST_DB_FILE)
    except Exception:
        pass

test_engine = create_engine(f"sqlite:///{TEST_DB_FILE}", connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

passed = 0
failed = 0

def run_test(name, func):
    global passed, failed
    print(f"Running: {name} ... ", end="", flush=True)
    try:
        func()
        print("[PASS]")
        passed += 1
    except Exception as e:
        print("[FAIL]")
        traceback.print_exc()
        failed += 1

# ================= TESTS =================

def test_1_dti_calculations():
    # Example from spec: Monthly income = ₹50,000, debt = ₹15,000 => 30.0%
    dti = calculate_dti(15000.0, 50000.0)
    assert dti == 30.0, f"Expected 30.0, got {dti}"
    assert calculate_dti(5000.0, 0.0) == 0.0

def test_2_utilization_calculations():
    # spec: balance = ₹70,000, limit = ₹1,00,000 => 70.0%
    util = calculate_credit_utilization(70000.0, 100000.0)
    assert util == 70.0, f"Expected 70.0, got {util}"
    assert calculate_credit_utilization(500.0, 0.0) == 0.0

def test_3_educational_status_thresholds():
    assert get_credit_score_status(780)["status"] == "Excellent"
    assert get_credit_score_status(720)["status"] == "Good"
    assert get_credit_score_status(670)["status"] == "Fair"
    assert get_credit_score_status(620)["status"] == "Needs Attention"
    assert get_dti_status(25.0)["status"] == "Healthy"
    assert get_dti_status(45.0)["status"] == "Moderate"
    assert get_dti_status(55.0)["status"] == "High Risk"
    assert get_utilization_status(25.0)["status"] == "Optimal"
    assert get_utilization_status(45.0)["status"] == "Moderate"
    assert get_utilization_status(65.0)["status"] == "High"

def test_4_bottlenecks_and_deltas():
    bottlenecks = identify_bottlenecks(620, 70.0, 55.0, 2, 120000.0, 100000.0)
    codes = [b["code"] for b in bottlenecks]
    assert "MISSED_PAYMENTS" in codes
    assert "OVER_LIMIT" in codes
    assert "HIGH_DTI" in codes

    baseline = {"credit_score": 680, "credit_utilization": 70.0, "dti_ratio": 40.0, "total_debt": 250000.0, "missed_payments": 1}
    current = {"credit_score": 725, "credit_utilization": 45.0, "dti_ratio": 30.0, "total_debt": 200000.0, "missed_payments": 0}
    deltas = calculate_metric_deltas(current, baseline)
    assert deltas["score_change"] == 45
    assert deltas["utilization_change"] == -25.0
    assert deltas["debt_change"] == -50000.0

user_token = ""
user_headers = {}

def test_5_auth_registration():
    global user_token, user_headers
    payload = {"name": "Arjun Verma", "email": "arjun.verma@example.com", "password": "Password123!"}
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "arjun.verma@example.com"
    user_token = data["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

def test_6_auth_duplicate_email():
    payload = {"name": "Arjun Clone", "email": "arjun.verma@example.com", "password": "Password123!"}
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400

def test_7_auth_login():
    res = client.post("/api/auth/login", json={"email": "arjun.verma@example.com", "password": "Password123!"})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_8_auth_me():
    res = client.get("/api/auth/me", headers=user_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "arjun.verma@example.com"

def test_9_financial_profile_creation_onboarding():
    # Scenario 1: Initial User Onboarding & Assessment
    payload = {
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
    res = client.post("/api/financial-profile", json=payload, headers=user_headers)
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["credit_score"] == 680
    assert data["dti_ratio"] == 30.0
    assert data["credit_utilization"] == 70.0
    assert data["score_status"]["status"] == "Fair"
    assert data["dti_status"]["status"] == "Healthy"
    assert data["utilization_status"]["status"] == "High"

def test_10_financial_profile_validations():
    # Out-of-bounds score (score must be 300-900)
    res = client.post("/api/financial-profile", json={"credit_score": 250, "monthly_income": 50000.0, "monthly_expenses": 20000.0, "total_debt": 0.0, "monthly_debt_payment": 0.0, "credit_limit": 50000.0, "credit_balance": 5000.0}, headers=user_headers)
    assert res.status_code in [400, 422]

def test_11_financial_profile_update_monitoring():
    # Scenario 4: Real-time Credit Health Monitoring
    payload = {
        "credit_score": 725,
        "monthly_income": 55000.0,
        "monthly_expenses": 28000.0,
        "total_debt": 200000.0,
        "monthly_debt_payment": 12000.0,
        "credit_limit": 100000.0,
        "credit_balance": 45000.0,
        "missed_payments": 0,
        "active_loans": 1,
        "existing_credit_cards": 2,
        "loan_types": "Two-Wheeler Loan"
    }
    res = client.put("/api/financial-profile", json=payload, headers=user_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["credit_score"] == 725
    assert data["credit_utilization"] == 45.0
    assert data["missed_payments"] == 0

def test_12_dashboard_api_and_deltas():
    # Scenario 3: Progress Tracking
    res = client.get("/api/dashboard", headers=user_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["has_profile"] is True
    assert data["profile"]["credit_score"] == 725
    assert data["first_record_delta"]["has_baseline"] is True
    assert data["first_record_delta"]["score_change"] == 45  # 725 - 680 = +45 points
    assert data["first_record_delta"]["utilization_change"] == -25.0  # 45% - 70% = -25 pp
    assert len(data["score_history"]) >= 2
    assert "Credit Assistant provides educational information" in data["disclaimer"]

def test_13_credit_history_api():
    res = client.get("/api/credit-history", headers=user_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["total_records"] >= 2
    assert data["earliest_score"] == 680
    assert data["latest_score"] == 725
    assert data["net_score_change"] == 45
    assert "Change since your first recorded score: +45 points" in data["wording"]

def test_14_ai_advisor_consultation():
    # Scenario 2: AI Financial Consultation
    res = client.post("/api/ai/advice", json={"additional_notes": "Planning for home loan"}, headers=user_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "summary" in data and len(data["summary"]) > 0
    assert "credit_health_status" in data
    assert "bottlenecks" in data and len(data["bottlenecks"]) > 0
    assert "recommendations" in data and len(data["recommendations"]) > 0
    assert "five_step_roadmap" in data and len(data["five_step_roadmap"]) == 5
    assert "assumptions" in data and len(data["assumptions"]) > 0
    assert "Credit Assistant provides educational information" in data["disclaimer"]

    # History verification
    hist = client.get("/api/ai/history", headers=user_headers)
    assert hist.status_code == 200
    assert len(hist.json()) >= 1

if __name__ == "__main__":
    tests = [
        ("DTI Calculations", test_1_dti_calculations),
        ("Credit Utilization Calculations", test_2_utilization_calculations),
        ("Educational Status Thresholds", test_3_educational_status_thresholds),
        ("Bottlenecks & Deltas", test_4_bottlenecks_and_deltas),
        ("Auth Registration", test_5_auth_registration),
        ("Auth Duplicate Email Rejection", test_6_auth_duplicate_email),
        ("Auth Login", test_7_auth_login),
        ("Auth Current User /me", test_8_auth_me),
        ("Financial Profile Creation (Onboarding)", test_9_financial_profile_creation_onboarding),
        ("Financial Profile Validations", test_10_financial_profile_validations),
        ("Financial Profile Update (Monitoring)", test_11_financial_profile_update_monitoring),
        ("Dashboard API & Progress Deltas", test_12_dashboard_api_and_deltas),
        ("Credit History Tracking & Wording", test_13_credit_history_api),
        ("AI Advisor Consultation & Roadmap", test_14_ai_advisor_consultation)
    ]

    print("\n==========================================")
    print("      RUNNING CREDIT ASSISTANT TEST SUITE ")
    print("==========================================\n")
    start_time = time.time()
    for name, func in tests:
        run_test(name, func)
    duration = time.time() - start_time

    print("\n==========================================")
    print(f"Results: {passed} passed, {failed} failed in {duration:.2f}s")
    print("==========================================\n")

    # Clean up test db
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    if failed > 0:
        sys.exit(1)
    sys.exit(0)
