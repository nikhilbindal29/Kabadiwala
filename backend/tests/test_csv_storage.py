"""
tests/test_csv_storage.py - Tests for CSV repository layer.
"""
import pytest
from app.storage.storage_factory import get_repo, CSV_SCHEMAS


def test_all_18_csv_schemas_exist():
    assert len(CSV_SCHEMAS) == 18
    for name, headers in CSV_SCHEMAS.items():
        assert "id" in headers
        repo = get_repo(name)
        assert repo is not None


def test_csv_crud_operations():
    repo = get_repo("users")
    test_email = "csv_test@example.com"

    # Insert
    inserted = repo.insert({
        "full_name": "CSV Test User",
        "email": test_email,
        "phone": "9876543210",
        "role": "SELLER",
        "account_status": "active",
        "preferred_language": "hi",
    })
    assert inserted["id"] is not None
    assert inserted["email"] == test_email

    # Find by ID
    found = repo.find_by_id(inserted["id"])
    assert found is not None
    assert found["email"] == test_email

    # Update
    updated = repo.update(inserted["id"], {"full_name": "Updated Name"})
    assert updated is not None
    assert updated["full_name"] == "Updated Name"

    # Query with Unicode (Hindi)
    repo.update(inserted["id"], {"full_name": "राम कुमार"})
    unicode_found = repo.find_by_id(inserted["id"])
    assert unicode_found["full_name"] == "राम कुमार"

    # Delete
    deleted = repo.delete(inserted["id"])
    assert deleted is True
    assert repo.find_by_id(inserted["id"]) is None

