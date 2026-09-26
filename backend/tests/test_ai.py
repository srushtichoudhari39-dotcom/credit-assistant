import pytest

def test_ai_advice_without_profile(client, authenticated_user):
    headers = authenticated_user["headers"]
    res = client.post("/api/ai/advice", json={}, headers=headers)
    assert res.status_code == 400
    assert "profile" in res.json()["detail"].lower()

def test_ai_advice_with_profile(client, authenticated_user):
    headers = authenticated_user["headers"]

    # Create profile
    client.post("/api/financial-profile", json={
        "credit_score": 680,
        "monthly_income": 50000.0,
        "monthly_expenses": 30000.0,
        "total_debt": 250000.0,
        "monthly_debt_payment": 15000.0,
        "credit_limit": 100000.0,
        "credit_balance": 70000.0,
        "missed_payments": 1,
        "active_loans": 1,
        "loan_types": "Personal Loan"
    }, headers=headers)

    # Request AI advice
    res = client.post("/api/ai/advice", json={"additional_notes": "Planning to apply for a home loan in 1 year."}, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "summary" in data and len(data["summary"]) > 0
    assert "credit_health_status" in data
    assert "bottlenecks" in data and len(data["bottlenecks"]) > 0
    assert "recommendations" in data and len(data["recommendations"]) > 0
    assert "five_step_roadmap" in data and len(data["five_step_roadmap"]) == 5
    
    # Check roadmap step details
    step1 = data["five_step_roadmap"][0]
    assert step1["step_number"] == 1
    assert "title" in step1 and len(step1["title"]) > 0
    assert "action" in step1 and len(step1["action"]) > 0
    assert "rationale" in step1 and len(step1["rationale"]) > 0

    # Check assumptions and mandatory educational disclaimer
    assert "assumptions" in data and len(data["assumptions"]) > 0
    assert "Credit Assistant provides educational information" in data["disclaimer"]

    # Verify consultation history
    hist_res = client.get("/api/ai/history", headers=headers)
    assert hist_res.status_code == 200
    consultations = hist_res.json()
    assert len(consultations) >= 1
    assert consultations[0]["summary"] == data["summary"]
