import pytest

def test_register_success(client):
    payload = {
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "password": "ValidPassword123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "priya.patel@example.com"
    assert data["user"]["name"] == "Priya Patel"
    assert data["user"]["has_profile"] is False

def test_register_duplicate_email(client):
    payload = {
        "name": "Rohan Mehta",
        "email": "rohan.mehta@example.com",
        "password": "ValidPassword123"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()

def test_login_success(client):
    reg_payload = {
        "name": "Vikram Singh",
        "email": "vikram.singh@example.com",
        "password": "Password789!"
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "vikram.singh@example.com",
        "password": "Password789!"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "vikram.singh@example.com"

def test_login_invalid_credentials(client):
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "WrongPassword"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()

def test_get_me_authenticated(client, authenticated_user):
    headers = authenticated_user["headers"]
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == authenticated_user["user"]["id"]
    assert data["email"] == authenticated_user["user"]["email"]

def test_get_me_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
