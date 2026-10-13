"""
scripts/provision_admin.py - Local development helper to provision the initial administrator.
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app import config
from app.storage.storage_factory import initialize_all_csv_files
from app.services.auth_service import get_auth_service


def main():
    print("=" * 60)
    print("ScrapSetu — Initial Administrator Provisioning")
    print("=" * 60)

    config.ensure_dirs()
    initialize_all_csv_files()

    auth_service = get_auth_service()

    token = config.ADMIN_SETUP_TOKEN
    if not token:
        print("ERROR: ADMIN_SETUP_TOKEN is not set in backend/.env")
        sys.exit(1)

    admin_data = {
        "full_name": "System Administrator",
        "email": "admin@scrapsetu.in",
        "phone": "9999999999",
        "password": "AdminSecurePassword123!",
        "preferred_language": "en",
        "city": "National",
    }

    try:
        user = auth_service.provision_admin(token, admin_data)
        print("\nSuccess! Administrator created:")
        print(f"ID:    {user['id']}")
        print(f"Name:  {user['full_name']}")
        print(f"Email: {user['email']}")
        print(f"Role:  {user['role']}")
        print("\nDefault credentials:")
        print("Email:    admin@scrapsetu.in")
        print("Password: AdminSecurePassword123!")
    except Exception as e:
        print(f"\nNotice: {e}")


if __name__ == "__main__":
    main()

