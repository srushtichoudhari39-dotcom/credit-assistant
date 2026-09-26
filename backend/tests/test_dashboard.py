import pytest

def test_dashboard_empty_profile(client, authenticated_user):
    headers = authenticated_user["headers"]
    res = client.get("/api/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["has_profile"] is False
    assert data["profile"] is None
    assert "Credit Assistant provides educational information" in data["disclaimer"]

def test_dashboard_with_profile_and_deltas(client, authenticated_user):
    headers = authenticated_user["headers"]
    
    # Initial onboarding snapshot
    client.post("/api/financial-profile", json={
        "credit_score": 680,
        "monthly_income": 50000.0,
        "monthly_expenses": 30000.0,
        "total_debt": 250000.0,
        "monthly_debt_payment": 15000.0,
        "credit_limit": 100000.0,
        "credit_balance": 70000.0,
        "missed_payments": 1
    }, headers=headers)

    # Secondary updated snapshot
    client.put("/api/financial-profile", json={
        "credit_score": 725,
        "monthly_income": 50000.0,
        "monthly_expenses": 28000.0,
        "total_debt": 215000.0,
        "monthly_debt_payment": 13000.0,
        "credit_limit": 100000.0,
        "credit_balance": 45000.0,
        "missed_payments": 0
    }, headers=headers)

    res = client.get("/api/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["has_profile"] is True
    assert data["profile"]["credit_score"] == 725
    assert data["profile"]["score_status"]["status"] == "Good"
    assert data["first_record_delta"]["has_baseline"] is True
    assert data["first_record_delta"]["score_change"] == 45
    assert data["first_record_delta"]["utilization_change"] == -25.0
    assert len(data["score_history"]) >= 2
    assert "Credit Assistant provides educational information" in data["disclaimer"]
