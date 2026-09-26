import pytest
from app.services.calculations import (
    calculate_dti,
    calculate_credit_utilization,
    identify_bottlenecks,
    calculate_metric_deltas
)
from app.utils.constants import (
    get_credit_score_status,
    get_dti_status,
    get_utilization_status
)

def test_calculate_dti_standard():
    # Example from prompt: Monthly income = ₹50,000, debt payments = ₹15,000 => 30.0%
    dti = calculate_dti(monthly_debt_payment=15000.0, monthly_income=50000.0)
    assert dti == 30.0

def test_calculate_dti_zero_income():
    dti = calculate_dti(monthly_debt_payment=5000.0, monthly_income=0.0)
    assert dti == 0.0

def test_calculate_credit_utilization_standard():
    # Example: balance = ₹70,000, limit = ₹1,00,000 => 70.0%
    util = calculate_credit_utilization(credit_balance=70000.0, credit_limit=100000.0)
    assert util == 70.0

def test_calculate_credit_utilization_zero_limit():
    util = calculate_credit_utilization(credit_balance=1000.0, credit_limit=0.0)
    assert util == 0.0

def test_credit_score_status_bands():
    assert get_credit_score_status(780)["status"] == "Excellent"
    assert get_credit_score_status(720)["status"] == "Good"
    assert get_credit_score_status(670)["status"] == "Fair"
    assert get_credit_score_status(620)["status"] == "Needs Attention"

def test_dti_status_thresholds():
    assert get_dti_status(25.0)["status"] == "Healthy"
    assert get_dti_status(42.0)["status"] == "Moderate"
    assert get_dti_status(55.0)["status"] == "High Risk"

def test_utilization_status_thresholds():
    assert get_utilization_status(20.0)["status"] == "Optimal"
    assert get_utilization_status(40.0)["status"] == "Moderate"
    assert get_utilization_status(65.0)["status"] == "High"

def test_identify_bottlenecks_comprehensive():
    bottlenecks = identify_bottlenecks(
        credit_score=620,
        credit_utilization=70.0,
        dti_ratio=52.0,
        missed_payments=2,
        credit_balance=120000.0,
        credit_limit=100000.0
    )
    codes = [b["code"] for b in bottlenecks]
    assert "MISSED_PAYMENTS" in codes
    assert "OVER_LIMIT" in codes
    assert "HIGH_DTI" in codes
    assert "LOW_CREDIT_SCORE" in codes

def test_metric_deltas_calculation():
    baseline = {
        "credit_score": 680,
        "credit_utilization": 70.0,
        "dti_ratio": 40.0,
        "total_debt": 250000.0,
        "missed_payments": 1
    }
    current = {
        "credit_score": 725,
        "credit_utilization": 45.0,
        "dti_ratio": 30.0,
        "total_debt": 200000.0,
        "missed_payments": 0
    }
    deltas = calculate_metric_deltas(current, baseline)
    assert deltas["has_baseline"] is True
    assert deltas["score_change"] == 45  # +45 points
    assert deltas["utilization_change"] == -25.0  # -25 pp
    assert deltas["dti_change"] == -10.0
    assert deltas["debt_change"] == -50000.0
    assert deltas["missed_payments_change"] == -1
