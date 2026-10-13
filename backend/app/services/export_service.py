"""
services/export_service.py - Combined CSV export generator.

Generates backend/data/exports/scrapsetu_all_data.csv containing all non-secret
records from all 18 authoritative CSV tables.
"""
import csv
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Set

from app import config
from app.storage.storage_factory import CSV_SCHEMAS, get_repo

# Fields that MUST NEVER be included in exports
SECRET_FIELDS: Set[str] = {
    "password_hash",
    "password",
    "token",
    "access_token",
    "refresh_token",
    "otp",
    "secret",
}

EXPORT_HEADERS: List[str] = [
    "entity_type",
    "entity_id",
    "export_timestamp",
    "schema_version",
    "field_name",
    "field_value",
]

SCHEMA_VERSION = "1.0.0"


class ExportService:
    def generate_combined_export(self) -> Path:
        """
        Export all entity records to backend/data/exports/scrapsetu_all_data.csv.
        Returns the absolute path to the generated export file.
        """
        export_dir = config.DATA_DIR / "exports"
        export_dir.mkdir(parents=True, exist_ok=True)
        target_path = export_dir / "scrapsetu_all_data.csv"

        now_str = datetime.now(timezone.utc).isoformat()

        # Atomic write to temporary file
        with tempfile.NamedTemporaryFile(
            mode="w",
            newline="",
            encoding="utf-8",
            dir=export_dir,
            delete=False,
            suffix=".tmp",
        ) as tmp:
            writer = csv.writer(tmp, quoting=csv.QUOTE_ALL)
            writer.writerow(EXPORT_HEADERS)

            for entity_type in sorted(CSV_SCHEMAS.keys()):
                repo = get_repo(entity_type)
                rows = repo.find_all()

                for row in rows:
                    rec_id = row.get("id", "")
                    for field_name in sorted(row.keys()):
                        if field_name.lower() in SECRET_FIELDS:
                            continue  # Strict secret exclusion
                        val = row.get(field_name, "")
                        writer.writerow([
                            entity_type,
                            rec_id,
                            now_str,
                            SCHEMA_VERSION,
                            field_name,
                            str(val) if val is not None else "",
                        ])
            tmp_path = Path(tmp.name)

        # Atomically replace target
        os.replace(tmp_path, target_path)
        return target_path


_instance = ExportService()


def get_export_service() -> ExportService:
    return _instance

