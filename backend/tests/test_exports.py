"""
tests/test_exports.py - Tests for combined CSV export and secret redaction.
"""
import pytest
from app.services.export_service import get_export_service, SECRET_FIELDS


def test_combined_export_generation_and_secret_exclusion():
    service = get_export_service()
    export_path = service.generate_combined_export()

    assert export_path.exists()
    assert export_path.name == "scrapsetu_all_data.csv"

    # Read content to verify header and secret exclusion
    with open(export_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "entity_type" in content
    assert "entity_id" in content
    assert "export_timestamp" in content
    assert "schema_version" in content

    # Verify no secret headers or hashes leaked
    lines = content.splitlines()
    for line in lines:
        for secret in SECRET_FIELDS:
            assert f'"{secret}"' not in line, f"Secret field '{secret}' found in export!"

