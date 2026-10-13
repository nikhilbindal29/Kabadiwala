"""
tests/test_marketplace.py - Tests for listing creation, pickups, and state machines.
"""
import pytest
from fastapi.testclient import TestClient


def test_listing_and_pickup_lifecycle(client: TestClient):
    # 1. Register seller
    seller_email = "marketplace_seller@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Market Seller",
        "email": seller_email,
        "phone": "9811122233",
        "password": "Password123!",
        "role": "SELLER",
        "city": "Mumbai",
    })
    seller_login = client.post("/api/auth/login", json={"email": seller_email, "password": "Password123!"}).json()
    seller_token = seller_login["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # 2. Register collector
    collector_email = "marketplace_collector@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Market Collector",
        "email": collector_email,
        "phone": "9844455566",
        "password": "Password123!",
        "role": "COLLECTOR",
        "city": "Mumbai",
    })
    collector_login = client.post("/api/auth/login", json={"email": collector_email, "password": "Password123!"}).json()
    collector_token = collector_login["access_token"]
    collector_headers = {"Authorization": f"Bearer {collector_token}"}

    # 3. Create listing with pickup request
    create_res = client.post(
        "/api/seller/listings",
        headers=seller_headers,
        json={
            "title": "Used CRT Monitor",
            "material_category": "cat_electronics",
            "condition": "Poor",
            "quantity": 1,
            "unit": "pieces",
            "estimated_weight_kg": 12.5,
            "price_expectation": 300,
            "pickup_address": "Flat 402, Andheri West",
            "city": "Mumbai",
            "request_pickup": True,
        },
    )
    assert create_res.status_code == 201
    listing = create_res.json()
    listing_id = listing["id"]

    # 4. Collector views available pickups
    avail_res = client.get("/api/collector/available-pickups", headers=collector_headers)
    assert avail_res.status_code == 200
    pickups = avail_res.json()
    assert len(pickups) >= 1
    target_pickup = next(p for p in pickups if p.get("listing_id") == listing_id)

    # 5. Collector accepts pickup
    accept_res = client.post(f"/api/collector/pickups/{target_pickup['id']}/accept", headers=collector_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "ACCEPTED"

    # 6. Complete pickup
    complete_res = client.post(
        f"/api/collector/pickups/{target_pickup['id']}/complete",
        headers=collector_headers,
        json={
            "actual_weight_kg": 13.0,
            "notes": "Collected in good order",
        },
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "COMPLETED"

    # 7. Check inventory lot auto-created for collector
    inv_res = client.get("/api/collector/inventory", headers=collector_headers)
    assert inv_res.status_code == 200
    lots = inv_res.json()
    assert any(lot.get("source_listing_id") == listing_id for lot in lots)

