"""
tests/conftest.py - Pytest fixtures and test environment setup.
"""
import os
import shutil
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Configure test environment variables before importing app
test_data_dir = tempfile.mkdtemp(prefix="scrapsetu_test_")
os.environ["DATA_DIR"] = test_data_dir
os.environ["CSV_DIR"] = os.path.join(test_data_dir, "csv")
os.environ["UPLOADS_DIR"] = os.path.join(test_data_dir, "uploads")
os.environ["EXPORTS_DIR"] = os.path.join(test_data_dir, "exports")
os.environ["BACKUPS_DIR"] = os.path.join(test_data_dir, "backups")
os.environ["JWT_SECRET_KEY"] = "test_super_secret_key_1234567890_abcdef"
os.environ["ADMIN_SETUP_TOKEN"] = "test_admin_token"
os.environ["APP_ENV"] = "testing"

from app.main import app
from app.storage.storage_factory import initialize_all_csv_files


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    initialize_all_csv_files()
    yield
    # Cleanup temp directory
    shutil.rmtree(test_data_dir, ignore_errors=True)


@pytest.fixture
def client():
    return TestClient(app)

