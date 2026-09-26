import pytest

def test_create_financial_profile_success(client, authenticated_user):
    headers = authenticated_user["headers"]
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

    res = client.post("/api/financial-profile", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["credit_score"] == 680
    assert data["dti_ratio"] == 30.0  # (15000 / 50000) * 100
    assert data["credit_utilization"] == 70.0  # (70000 / 100000) * 100
    assert data["score_status"]["status"] == "Fair"
    assert data["dti_status"]["status"] == "Healthy"
    assert data["utilization_status"]["status"] == "High"

def test_create_financial_profile_invalid_score(client, authenticated_user):
    headers = authenticated_user["headers"]
    # Credit score below 300
    payload = {
        "credit_score": 250,
        "monthly_income": 50000.0,
        "monthly_expenses": 20000.0,
        "total_debt": 50000.0,
        "monthly_debt_payment": 5000.0,
        "credit_limit": 50000.0,
        "credit_balance": 10000.0
    }
    res = client.post("/api/financial-profile", json=payload, headers=headers)
    assert res.status_code == 422

def test_create_financial_profile_negative_income(client, authenticated_user):
    headers = authenticated_user["headers"]
    payload = {
        "credit_score": 700,
        "monthly_income": -5000.0,
        "monthly_expenses": 20000.0,
        "total_debt": 50000.0,
        "monthly_debt_payment": 5000.0,
        "credit_limit": 50000.0,
        "credit_balance": 10000.0
    }
    res = client.post("/api/financial-profile", json=payload, headers=headers)
    assert res.status_code == 422

def test_update_financial_profile(client, authenticated_user):
    headers = authenticated_user["headers"]
    initial_payload = {
        "credit_score": 680,
        "monthly_income": 50000.0,
        "monthly_expenses": 30000.0,
        "total_debt": 250000.0,
        "monthly_debt_payment": 15000.0,
        "credit_limit": 100000.0,
        "credit_balance": 70000.0,
        "missed_payments": 1,
        "active_loans": 2
    }
    client.post("/api/financial-profile", json=initial_payload, headers=headers)

    # User pays off debt and improves utilization (Scenario 4)
    updated_payload = {
        "credit_score": 725,
        "monthly_income": 55000.0,
        "monthly_expenses": 28000.0,
        "total_debt": 200000.0,
        "monthly_debt_payment": 12000.0,
        "credit_limit": 100000.0,
        "credit_balance": 45000.0,
        "missed_payments": 0,
        "active_loans": 1
    }
    res = client.put("/api/financial-profile", json=updated_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["credit_score"] == 725
    assert data["credit_utilization"] == 45.0  # (45000 / 100000) * 100
    assert data["dti_ratio"] == 21.82  # (12000 / 55000) * 100 = 21.818%
    assert data["missed_payments"] == 0

def test_balance_exceeding_limit_warning(client, authenticated_user):
    headers = authenticated_user["headers"]
    payload = {
        "credit_score": 670,
        "monthly_income": 60000.0,
        "monthly_expenses": 35000.0,
        "total_debt": 150000.0,
        "monthly_debt_payment": 10000.0,
        "credit_limit": 50000.0,
        "credit_balance": 65000.0,  # Exceeds limit of 50000
        "missed_payments": 0
    }
    res = client.post("/api/financial-profile", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["validation_warning"] is not None
    assert "exceeds" in data["validation_warning"].lower()
