# ScrapSetu — Setup Guide

## Overview
ScrapSetu is a vernacular-first e-waste and recyclable-material marketplace connecting sellers, collectors (kabadiwalas), buyers, refurbishers, and authorized recyclers.

**Tech Stack:**
- **Mobile:** React Native + Expo + TypeScript + Expo Router
- **Backend:** FastAPI + Python 3.14 + Pydantic v2
- **Storage:** CSV files (repository pattern, PostgreSQL-ready)
- **Auth:** JWT (access + refresh tokens) + bcrypt

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

For Android development:
- Android Studio with SDK 33+
- Java 17+

For iOS development (macOS only):
- Xcode 15+
- CocoaPods

---

## Quick Start

### 1. Clone the Repository
```bash
git clone <repo-url>
cd scrapsetuu
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set JWT_SECRET_KEY and other values

# Start the backend
python run.py
# OR
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000  
API docs: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc

### 3. Provision the First Admin (Development Only)

```bash
# With the backend running:
cd backend
python scripts/provision_admin.py

# OR via API (requires ADMIN_SETUP_TOKEN from .env):
curl -X POST http://localhost:8000/api/auth/admin/provision \
  -H "Content-Type: application/json" \
  -H "X-Admin-Setup-Token: your_setup_token_from_env" \
  -d '{
    "full_name": "Admin User",
    "email": "admin@scrapsetu.in",
    "phone": "9999999999",
    "password": "SecureAdminPassword123!"
  }'
```

⚠️ **Never share or commit your ADMIN_SETUP_TOKEN.**

### 4. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL=http://localhost:8000

# Start Expo development server
npx expo start

# Run on Android emulator
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios

# Run on physical device (scan QR code with Expo Go app)
npx expo start
```

---

## Environment Variables

### Backend (.env)
```
# Required
JWT_SECRET_KEY=your-very-long-random-secret-key-change-this

# Optional (defaults shown)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
STORAGE_BACKEND=csv
DATA_DIR=data
APP_ENV=development
CORS_ORIGINS=["http://localhost:8081","exp://localhost:8081","http://localhost:19006"]

# Admin provisioning (development only)
ADMIN_SETUP_TOKEN=your-admin-setup-token-change-this

# File upload limits
MAX_UPLOAD_SIZE_MB=10
ALLOWED_IMAGE_TYPES=["image/jpeg","image/png","image/webp"]
ALLOWED_DOCUMENT_TYPES=["application/pdf","image/jpeg","image/png"]

# Rate limiting
RATE_LIMIT_LOGIN_PER_MINUTE=10

# AI material identification (optional)
AI_CLASSIFIER_URL=
AI_CLASSIFIER_API_KEY=
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_APP_ENV=development
```

For physical device testing, use your machine's local IP:
```
EXPO_PUBLIC_API_URL=http://192.168.1.xxx:8000
```

---

## Data Storage

All application data is stored in CSV files under `backend/data/csv/`:

| File | Purpose |
|------|---------|
| users.csv | All registered users |
| listings.csv | Seller item listings |
| pickup_requests.csv | Pickup assignments |
| inventory_lots.csv | Collector inventory |
| offers.csv | Buyer/recycler offers |
| orders.csv | Confirmed transactions |
| transactions.csv | Financial records |
| payments.csv | Payment details |
| handover_records.csv | Material handovers |
| recycler_documents.csv | Compliance documents |
| notifications.csv | User notifications |
| support_tickets.csv | Support requests |
| disputes.csv | Order disputes |
| material_categories.csv | Material taxonomy |
| service_areas.csv | Supported cities |
| app_settings.csv | Application config |
| audit_log.csv | Security audit trail |
| user_addresses.csv | User saved addresses |

CSV files are created automatically on first startup with correct headers.

⚠️ **CSV Limitations:**
- Not suitable for high concurrency (file-level locking used)
- No true ACID transactions (atomic writes used as mitigation)
- Not recommended for more than ~50,000 records per file
- See `docs/postgresql-migration.md` for migration guide

---

## Running Tests

### Backend Tests
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pytest tests/ -v
pytest tests/ -v --tb=short  # shorter tracebacks
pytest tests/test_auth.py -v  # specific module
```

### Mobile Type Check
```bash
cd mobile
npx tsc --noEmit
```

---

## Project Structure

```
scrapsetuu/
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── data/         # CSV files, uploads, exports
│   ├── tests/        # pytest test suite
│   └── requirements.txt
├── mobile/           # Expo React Native app
│   ├── app/          # Expo Router screens
│   ├── src/          # Shared code
│   └── assets/       # Images, fonts
└── docs/             # Documentation
```

---

## Development Workflow

### Adding a New Material Category
```bash
# Via Admin portal in the app, OR:
curl -X POST http://localhost:8000/api/admin/categories \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Solar Panels", "name_hi": "सौर पैनल", "is_active": true}'
```

### Exporting All Data
```bash
# Admin only:
curl -X GET http://localhost:8000/api/admin/export/combined \
  -H "Authorization: Bearer <admin_token>" \
  -o scrapsetu_export.csv
```

### Backing Up CSV Data
```bash
# Manual backup
cp -r backend/data/csv backend/data/backups/manual_$(date +%Y%m%d_%H%M%S)
```

---

## Building for Release

See [Build Configuration](#build-configuration) below.

### Android (APK/AAB)
```bash
cd mobile
# Development build
npx expo run:android

# Production build with EAS
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

### iOS
```bash
# Development (macOS only)
npx expo run:ios

# Production with EAS
eas build --platform ios --profile production
```

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Check if port 8000 is in use: `netstat -an | grep 8000`
- Check `.env` has `JWT_SECRET_KEY` set
- Check virtual environment is activated

### Mobile can't connect to backend
- Ensure backend is running on port 8000
- For physical device: use machine's LAN IP, not localhost
- Check `EXPO_PUBLIC_API_URL` in mobile `.env`
- Check CORS_ORIGINS in backend `.env` includes your Expo URL

### CSV file issues
- CSV files are created automatically on startup
- If corrupt, delete the specific CSV file and restart (it will be recreated empty)
- Check file permissions on `backend/data/csv/`

### Login fails
- Check email and password are correct
- Account may be suspended (check admin portal)
- Password reset via forgot-password flow

