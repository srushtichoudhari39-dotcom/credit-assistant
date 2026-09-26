import pytest

def test_credit_history_tracking(client, authenticated_user):
    headers = authenticated_user["headers"]

    # 1. Create initial profile (e.g. January: 680)
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

    # 2. Add periodic updates (e.g. February: 695, March: 710, April: 725)
    client.post("/api/credit-history", json={
        "credit_score": 695,
        "credit_utilization": 60.0,
        "dti_ratio": 28.0
    }, headers=headers)

    client.post("/api/credit-history", json={
        "credit_score": 710,
        "credit_utilization": 50.0,
        "dti_ratio": 25.0
    }, headers=headers)

    client.post("/api/credit-history", json={
        "credit_score": 725,
        "credit_utilization": 45.0,
        "dti_ratio": 22.0
    }, headers=headers)

    # 3. Retrieve credit history summary
    res = client.get("/api/credit-history", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] == 4
    assert data["earliest_score"] == 680
    assert data["latest_score"] == 725
    assert data["net_score_change"] == 45
    assert "Change since your first recorded score: +45 points" in data["wording"]
