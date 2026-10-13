"""
tests/test_auth.py - Tests for registration, login, JWT and access control.
"""
import pytest
from fastapi.testclient import TestClient
def test_user_registration_and_login(client: TestClient):
    reg_data = {
        "full_name": "Test Seller",
        "email": "seller_test@example.com",
        "phone": "9812345678",
        "password": "Password123!",
        "role": "SELLER",
        "city": "Mumbai",
    }
    # Register
    res = client.post("/api/auth/register", json=reg_data)
    assert res.status_code == 201
    user = res.json()
    assert "password_hash" not in user
    assert user["email"] == reg_data["email"]

    # Duplicate registration fails
    dup_res = client.post("/api/auth/register", json=reg_data)
    assert dup_res.status_code == 409

    # Cannot register as ADMIN publicly
    admin_reg = {**reg_data, "email": "fake_admin@example.com", "role": "ADMIN"}
    admin_res = client.post("/api/auth/register", json=admin_reg)
    assert admin_res.status_code == 400

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": reg_data["email"],
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    tokens = login_res.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Test /me endpoint with bearer token
    token = tokens["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == reg_data["email"]
