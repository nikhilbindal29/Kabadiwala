"""
storage/csv_repository.py - Thread-safe CSV-backed storage implementation.

Key design decisions:
- filelock.FileLock serializes all write operations per file.
- Atomic writes: data is written to a temp file then os.replace() renames it
  (rename is atomic on all POSIX and Windows NTFS systems).
- Reads do not hold a lock to maximise concurrency.
- IDs use uuid4 for global uniqueness.
- Timestamps use UTC ISO-8601.
- Files are created with headers on first access if they don't exist.
"""
import csv
import os
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from filelock import FileLock

from app.storage.base import BaseStorage


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class CSVRepository(BaseStorage):
    """
    Generic CSV repository.

    Args:
        file_path: Absolute path to the .csv file.
        headers: Ordered list of column names (including 'id').
        id_prefix: Optional prefix for generated IDs (e.g. 'usr_').
    """

    def __init__(
        self,
        file_path: Path,
        headers: List[str],
        id_prefix: str = "",
    ) -> None:
        self._path = file_path
        self._headers = headers
        self._id_prefix = id_prefix
        self._lock = FileLock(str(file_path) + ".lock")
        self._ensure_file()

    # ── Internals ─────────────────────────────────────────────────────────────

    def _ensure_file(self) -> None:
        """Create the CSV file with headers if it does not exist."""
        if not self._path.exists():
            self._path.parent.mkdir(parents=True, exist_ok=True)
            with open(self._path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=self._headers)
                writer.writeheader()

    def _read_all(self) -> List[Dict[str, Any]]:
        """Read all rows without holding a lock (safe for reads)."""
        self._ensure_file()
        with open(self._path, "r", newline="", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def _atomic_write(self, rows: List[Dict[str, Any]]) -> None:
        """
        Write rows atomically using a temp file + os.replace().
        Must be called while the FileLock is held.
        """
        dir_ = self._path.parent
        fd, tmp_path = tempfile.mkstemp(dir=str(dir_), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=self._headers, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(rows)
            os.replace(tmp_path, self._path)
        except Exception:
            # Clean up temp file on failure
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise

    def _new_id(self) -> str:
        return f"{self._id_prefix}{uuid.uuid4().hex}"

    # ── Public API ────────────────────────────────────────────────────────────

    def find_all(self) -> List[Dict[str, Any]]:
        """Return all records."""
        return self._read_all()

    def find_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        """Return a single record by its id, or None."""
        for row in self._read_all():
            if row.get("id") == record_id:
                return row
        return None

    def find_by(self, **kwargs: Any) -> List[Dict[str, Any]]:
        """
        Return all records matching ALL provided keyword filters.
        Filter values are compared as strings (since CSV stores everything as str).
        """
        results = []
        for row in self._read_all():
            if all(row.get(k) == str(v) for k, v in kwargs.items()):
                results.append(row)
        return results

    def find_one_by(self, **kwargs: Any) -> Optional[Dict[str, Any]]:
        """Return the first record matching all filters, or None."""
        matches = self.find_by(**kwargs)
        return matches[0] if matches else None

    def insert(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a new record, auto-assigning id, created_at, updated_at.

        Returns the inserted record dict.
        """
        now = _utcnow()
        new_record: Dict[str, Any] = {h: "" for h in self._headers}
        new_record.update(record)
        if not new_record.get("id"):
            new_record["id"] = self._new_id()
        if "created_at" in self._headers and not new_record.get("created_at"):
            new_record["created_at"] = now
        if "updated_at" in self._headers and not new_record.get("updated_at"):
            new_record["updated_at"] = now

        with self._lock:
            rows = self._read_all()
            rows.append(new_record)
            self._atomic_write(rows)

        return new_record

    def update(self, record_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update fields on a record identified by id.

        Returns the updated record, or None if not found.
        """
        updated: Optional[Dict[str, Any]] = None

        with self._lock:
            rows = self._read_all()
            new_rows = []
            for row in rows:
                if row.get("id") == record_id:
                    row.update(updates)
                    if "updated_at" in self._headers:
                        row["updated_at"] = _utcnow()
                    updated = dict(row)
                new_rows.append(row)
            if updated is not None:
                self._atomic_write(new_rows)

        return updated

    def delete(self, record_id: str) -> bool:
        """
        Delete a record by id.

        Returns True if a record was deleted, False if not found.
        """
        deleted = False

        with self._lock:
            rows = self._read_all()
            new_rows = [r for r in rows if r.get("id") != record_id]
            if len(new_rows) < len(rows):
                deleted = True
                self._atomic_write(new_rows)

        return deleted

    def count(self) -> int:
        """Return the total number of records."""
        return len(self._read_all())

    def backup(self) -> str:
        """
        Copy the CSV file to the backups directory with a timestamp suffix.

        Returns the path to the backup file.
        """
        from app import config  # avoid circular at module level

        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_name = f"{self._path.stem}_{ts}.csv"
        backup_path = config.BACKUPS_DIR / backup_name
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(self._path, backup_path)
        return str(backup_path)

    def upsert_by(self, match_fields: Dict[str, Any], record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert or update a record matching all match_fields.

        If a matching record is found, it is updated with `record` values.
        Otherwise a new record is inserted.
        """
        existing = self.find_one_by(**match_fields)
        if existing:
            return self.update(existing["id"], record) or existing
        return self.insert(record)
