# ScrapSetu — PostgreSQL Migration Guide

## Overview
ScrapSetu v1 uses CSV files as its storage backend. This guide explains how to migrate to PostgreSQL when you're ready to scale.

The application's repository pattern means you can swap the storage layer **without rewriting business logic or API contracts**.

---

## Architecture: Repository Pattern

```
API Routes
    ↓
Services (business logic)
    ↓
Repository Interfaces (abstract)
    ↓
CSV Implementation  ←→  [Future] PostgreSQL Implementation
```

Every service depends on a repository interface, not a concrete implementation. The storage backend is configured via the `STORAGE_BACKEND` environment variable.

---

## Step 1: Add PostgreSQL Dependencies

```bash
pip install sqlalchemy[asyncio]==2.0.36
pip install asyncpg==0.29.0
pip install alembic==1.13.3
pip install psycopg2-binary==2.9.10
```

Add to `requirements.txt`.

---

## Step 2: Create SQLAlchemy Models

Create `backend/app/storage/postgresql_models.py`:

```python
from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    account_status = Column(String(20), default="active")
    verification_status = Column(String(20), default="unverified")
    preferred_language = Column(String(5), default="en")
    city = Column(String(100))
    locality = Column(String(100))
    seller_type = Column(String(20))
    business_name = Column(String(255))
    business_details = Column(Text)
    service_locations = Column(Text)  # JSON string
    material_categories = Column(Text)  # JSON string
    capacity = Column(String(100))
    facility_address = Column(Text)
    authorization_details = Column(Text)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

class ListingModel(Base):
    __tablename__ = "listings"
    id = Column(String(36), primary_key=True)
    seller_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    material_category = Column(String(100))
    subcategory = Column(String(100))
    description = Column(Text)
    condition = Column(String(20))
    quantity = Column(Float)
    unit = Column(String(20))
    estimated_weight_kg = Column(Float)
    price_expectation = Column(Float)
    image_paths = Column(Text)  # JSON array string
    pickup_address = Column(Text)
    city = Column(String(100))
    locality = Column(String(100))
    status = Column(String(20), default="DRAFT", index=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

# ... (similar models for all other entities)
```

---

## Step 3: Implement PostgreSQL Repositories

Create `backend/app/storage/postgresql_repository.py`:

```python
from .base import BaseRepository
from sqlalchemy.ext.asyncio import AsyncSession

class PostgreSQLUserRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def find_by_id(self, id: str) -> dict | None:
        result = await self.session.get(UserModel, id)
        return self._to_dict(result) if result else None
    
    async def find_by_field(self, field: str, value: str) -> list[dict]:
        stmt = select(UserModel).where(getattr(UserModel, field) == value)
        result = await self.session.execute(stmt)
        return [self._to_dict(row) for row in result.scalars()]
    
    async def create(self, data: dict) -> dict:
        model = UserModel(**data)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_dict(model)
    
    # ... implement all interface methods
```

---

## Step 4: Initialize Alembic

```bash
cd backend
alembic init alembic

# Edit alembic/env.py to use your DATABASE_URL
# Edit alembic.ini to set sqlalchemy.url

alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

---

## Step 5: Update storage_factory.py

```python
STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "csv")

def get_user_repository():
    if STORAGE_BACKEND == "csv":
        return CSVUserRepository()
    elif STORAGE_BACKEND == "postgresql":
        return PostgreSQLUserRepository(get_db_session())
    else:
        raise ValueError(f"Unsupported STORAGE_BACKEND: {STORAGE_BACKEND}")
```

---

## Step 6: Data Migration

### Export CSV Data
```bash
# 1. Generate combined export
curl -X GET http://localhost:8000/api/admin/export/combined \
  -H "Authorization: Bearer <admin_token>" \
  -o migration_export.csv

# 2. Run validation script
python scripts/validate_csv_for_migration.py backend/data/csv/
```

### Migration Script
Create `backend/scripts/migrate_csv_to_postgresql.py`:

```python
"""
Migrate CSV data to PostgreSQL.
Run AFTER setting up PostgreSQL schema with Alembic.
"""
import csv
import asyncio
from pathlib import Path
from app.storage.csv_repository import CSVUserRepository
# ... import all CSV repos

CSV_DIR = Path("data/csv")

async def migrate():
    # 1. Read all CSV data
    # 2. Validate foreign key references
    # 3. Detect duplicates
    # 4. Insert in dependency order:
    #    users → listings → pickup_requests → inventory_lots 
    #    → offers → orders → transactions → payments
    #    → handover_records → recycler_documents → notifications
    #    → support_tickets → disputes → audit_log
    # 5. Verify row counts match
    # 6. Generate migration report

asyncio.run(migrate())
```

---

## Migration Checklist

### Pre-migration
- [ ] Back up all CSV files
- [ ] Generate combined CSV export
- [ ] Review row counts per CSV file
- [ ] Validate all foreign key references
- [ ] Test PostgreSQL connection
- [ ] Run schema migrations (Alembic)
- [ ] Test with a subset of data first

### Migration
- [ ] Run migration script in dry-run mode
- [ ] Review migration report
- [ ] Run actual migration
- [ ] Verify row counts match

### Post-migration
- [ ] Switch `STORAGE_BACKEND=postgresql` in `.env`
- [ ] Run all automated tests against PostgreSQL
- [ ] Manual smoke testing of all portals
- [ ] Verify file upload paths are correct
- [ ] Check audit log continuity

### Rollback Plan
- [ ] Keep CSV files intact until PostgreSQL is fully verified
- [ ] To rollback: set `STORAGE_BACKEND=csv` and restart

---

## Schema Versioning

Each CSV file includes a schema version in the combined export header. When migrating, always match schema versions. The current schema version is `1.0.0`.

---

## ID Strategy

All entity IDs are UUIDs (v4), making them PostgreSQL-compatible without any transformation. Primary keys remain the same strings.

---

## Data Type Mapping

| CSV (string) | PostgreSQL |
|-------------|-----------|
| UUID string | UUID or VARCHAR(36) |
| ISO8601 datetime | TIMESTAMP WITH TIME ZONE |
| Float string | NUMERIC(12,2) |
| JSON string | JSONB |
| Boolean string | BOOLEAN |
| Comma-separated paths | TEXT or JSONB |

---

## Known Limitations of CSV Storage

These limitations are addressed by migrating to PostgreSQL:

1. **No true ACID transactions** — CSV uses file locks and atomic writes as a mitigation, but two concurrent writes can still corrupt in edge cases
2. **No foreign key enforcement** — validated in application code only
3. **Linear scan performance** — no indexes; slow for large datasets
4. **No full-text search** — search is substring matching in memory
5. **Single-process file locking** — does not work across multiple server instances
6. **No connection pooling** — every request reads the full CSV file
7. **Recommended max ~10,000 records per file** for acceptable performance

PostgreSQL addresses all of these limitations.

