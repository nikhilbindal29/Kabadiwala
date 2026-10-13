# ScrapSetu — API Contracts

**Base URL:** `http://localhost:8000`  
**API Prefix:** `/api`  
**Auth:** Bearer JWT token in `Authorization` header  
**Content-Type:** `application/json` (except file uploads: `multipart/form-data`)

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user (non-admin roles only).

**Request:**
```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!",
  "preferred_language": "hi",
  "city": "Mumbai",
  "locality": "Andheri West",
  "role": "SELLER",
  "seller_type": "household",
  "business_name": null
}
```

**Response 201:**
```json
{
  "id": "uuid-...",
  "full_name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "role": "SELLER",
  "account_status": "active",
  "verification_status": "unverified",
  "preferred_language": "hi",
  "city": "Mumbai",
  "created_at": "2026-10-13T06:27:02Z"
}
```

**Errors:**
- `409` — Email or phone already registered
- `422` — Validation error
- `400` — Admin role not allowed via public registration

---

### POST /api/auth/login
**Request:**
```json
{
  "email": "rahul@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "uuid-...",
    "full_name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "SELLER",
    "account_status": "active",
    "preferred_language": "hi"
  }
}
```

**Errors:**
- `401` — Invalid credentials
- `403` — Account suspended
- `429` — Too many attempts

---

### POST /api/auth/refresh
**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "expires_in": 1800
}
```

---

### POST /api/auth/logout
**Headers:** `Authorization: Bearer <token>`  
**Response 200:** `{"message": "Logged out successfully"}`

---

### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`  
**Response 200:** Full user profile object

---

### POST /api/auth/change-password
**Headers:** `Authorization: Bearer <token>`  
**Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

---

### POST /api/auth/forgot-password
**Request:** `{"email": "user@example.com"}`  
**Development response:** `{"message": "OTP sent", "dev_otp": "123456"}`  
**Production response:** `{"message": "If that email exists, an OTP was sent"}`

---

### POST /api/auth/reset-password
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewPass456!"
}
```

---

### POST /api/auth/admin/provision
**Headers:** `X-Admin-Setup-Token: <setup_token>`  
**Request:**
```json
{
  "full_name": "Admin User",
  "email": "admin@scrapsetu.in",
  "phone": "9999999999",
  "password": "AdminPass123!"
}
```

---

## Common Response Formats

### Paginated List Response
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8,
  "has_next": true,
  "has_prev": false
}
```

### Error Response
```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE",
  "field_errors": {
    "email": ["Invalid email format"]
  }
}
```

---

## Seller Endpoints

### GET /api/seller/dashboard
**Response:**
```json
{
  "active_listings": 5,
  "pending_pickups": 2,
  "incoming_offers": 3,
  "completed_sales": 12,
  "recent_listings": [...],
  "recent_offers": [...]
}
```

### GET /api/seller/listings
**Query params:** `page`, `page_size`, `status`, `category`  
**Response:** Paginated list of Listing objects

### POST /api/seller/listings
**Request:**
```json
{
  "title": "Old Dell Laptop",
  "material_category": "cat_electronics",
  "subcategory": "Laptops",
  "description": "Non-working Dell laptop, 5 years old",
  "condition": "Poor",
  "quantity": 1,
  "unit": "pieces",
  "estimated_weight_kg": 2.5,
  "price_expectation": 500,
  "pickup_address": "123 MG Road",
  "city": "Mumbai",
  "locality": "Andheri",
  "status": "DRAFT"
}
```

### PUT /api/seller/listings/{id}/images
**Content-Type:** multipart/form-data  
**Body:** `images[]` (up to 5 files)

---

## Collector Endpoints

### GET /api/collector/available-pickups
**Query params:** `city`, `category`, `page`

### POST /api/collector/pickups/{id}/accept
**Response:** Updated pickup request

### POST /api/collector/pickups/{id}/schedule
**Request:** `{"scheduled_at": "2026-10-15T10:00:00Z"}`

### POST /api/collector/inventory
**Request:**
```json
{
  "material_category": "cat_electronics",
  "subcategory": "Laptops",
  "quantity": 10,
  "unit": "pieces",
  "weight_kg": 25.0,
  "condition": "Mixed",
  "grade": "B",
  "asking_price": 5000,
  "city": "Mumbai"
}
```

---

## Buyer Endpoints

### GET /api/buyer/marketplace
**Query params:** `q` (search), `category`, `city`, `condition`, `min_price`, `max_price`, `sort_by`, `page`  
**Response:** Paginated list of InventoryLot objects (only status=ACTIVE, not RESERVED/SOLD)

### POST /api/buyer/offers
**Request:**
```json
{
  "lot_id": "uuid-...",
  "offer_price": 4500,
  "quantity": 10,
  "unit": "pieces",
  "transport_cost_estimate": 300,
  "valid_until": "2026-10-20T23:59:59Z",
  "notes": "Can pick up within 2 days of acceptance"
}
```

---

## Recycler Endpoints

### GET /api/recycler/material-marketplace
**Query params:** `category`, `city`, `min_weight`, `page`  
**Response:** Available lots eligible for recycler purchase

### POST /api/recycler/documents
**Content-Type:** multipart/form-data  
**Body:** `document_type`, `document_reference`, `expiry_date`, `file`

---

## Admin Endpoints

### GET /api/admin/dashboard
**Response:**
```json
{
  "total_users": 142,
  "users_by_role": {
    "SELLER": 80,
    "COLLECTOR": 30,
    "BUYER": 20,
    "RECYCLER": 12
  },
  "listings_by_status": {
    "DRAFT": 10,
    "ACTIVE": 45,
    "RESERVED": 8,
    "SOLD": 30,
    "CANCELLED": 5
  },
  "pending_verifications": 7,
  "open_disputes": 2,
  "recent_audit_events": [...]
}
```

### PUT /api/admin/users/{id}/status
**Request:** `{"status": "suspended", "reason": "Policy violation"}`

### PUT /api/admin/verification/{user_id}
**Request:**
```json
{
  "decision": "approved",
  "notes": "Documents verified"
}
```

### GET /api/admin/export/combined
**Response:** CSV file download (Content-Type: text/csv)  
**Excludes:** password_hash, tokens, OTPs

---

## Notification Endpoints

### GET /api/notifications
**Response:** Paginated list of notifications for current user

### PUT /api/notifications/{id}/read
### PUT /api/notifications/read-all

---

## File Upload Endpoints

### POST /api/uploads/image
**Content-Type:** multipart/form-data  
**Body:** `file` (JPEG/PNG/WebP, max 10MB)  
**Response:** `{"path": "uploads/img_uuid.jpg", "url": "/api/uploads/img_uuid.jpg"}`

### POST /api/uploads/document
**Body:** `file` (PDF/JPEG/PNG, max 10MB)

### GET /api/uploads/{path}
**Auth required.** Serves the file if the requesting user has access.

---

## Data Objects

### User Object
```json
{
  "id": "uuid",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "role": "SELLER|COLLECTOR|BUYER|RECYCLER|ADMIN",
  "account_status": "active|suspended|pending",
  "verification_status": "unverified|pending|verified|rejected",
  "preferred_language": "en|hi",
  "city": "string",
  "locality": "string",
  "seller_type": "household|individual|office|business|null",
  "business_name": "string|null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Listing Object
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "title": "string",
  "material_category": "cat_id",
  "subcategory": "string",
  "description": "string",
  "condition": "Excellent|Good|Fair|Poor",
  "quantity": 1,
  "unit": "pieces|kg|lots|sets",
  "estimated_weight_kg": 2.5,
  "price_expectation": 500,
  "image_paths": ["uploads/img1.jpg"],
  "pickup_address": "string",
  "city": "string",
  "locality": "string",
  "status": "DRAFT|ACTIVE|RESERVED|SOLD|CANCELLED",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### InventoryLot Object
```json
{
  "id": "uuid",
  "collector_id": "uuid",
  "source_listing_id": "uuid|null",
  "material_category": "cat_id",
  "subcategory": "string",
  "quantity": 10,
  "unit": "pieces",
  "weight_kg": 25.0,
  "condition": "string",
  "grade": "A|B|C|Mixed",
  "asking_price": 5000,
  "city": "string",
  "status": "ACTIVE|RESERVED|SOLD",
  "image_paths": [],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Offer Object
```json
{
  "id": "uuid",
  "lot_id": "uuid",
  "buyer_id": "uuid",
  "offer_price": 4500,
  "quantity": 10,
  "unit": "pieces",
  "transport_cost_estimate": 300,
  "valid_until": "ISO8601",
  "status": "PENDING|ACCEPTED|REJECTED|WITHDRAWN|EXPIRED",
  "notes": "string",
  "created_at": "ISO8601"
}
```

