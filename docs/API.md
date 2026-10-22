# REST API Specification — CertiChain

**Base URL**: `/api/v1`

All responses follow a consistent JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```
Errors return:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly description",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new student account.
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "STUDENT"
  }
  ```
- **Response**: `201 Created` with user profile and auth tokens.

### `POST /auth/issuer-application`
Submit an institutional registration application.
- **Request Body**:
  ```json
  {
    "fullName": "Dr. Robert Smith",
    "email": "robert@stanford.edu",
    "password": "SecurePassword2026!",
    "institutionName": "Stanford University",
    "institutionCode": "STANFORD",
    "officialEmail": "registrar@stanford.edu",
    "websiteUrl": "https://stanford.edu"
  }
  ```
- **Response**: `202 Accepted` (Pending Admin Review).

### `POST /auth/login`
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response**: Sets `refreshToken` in HttpOnly Cookie; returns `{ accessToken, user }`.

### `POST /auth/refresh`
- Exchanges valid HttpOnly refresh cookie for a fresh access token.

### `POST /auth/logout`
- Invalidates the active refresh token session and clears auth cookies.

### `GET /auth/me`
- Requires Bearer token. Returns authenticated user profile and permissions.

---

## 2. Institutional Administration

### `GET /admin/applications`
- **Role**: `SUPER_ADMIN`
- Returns all pending, approved, or rejected issuer applications.

### `POST /admin/applications/:id/approve`
- **Role**: `SUPER_ADMIN`
- Approves institutional application, provisions `Institution` entity, and elevates user to `INSTITUTION_ISSUER`.

### `POST /admin/applications/:id/reject`
- **Role**: `SUPER_ADMIN`
- Rejects application with notes.

### `GET /admin/users` & `PATCH /admin/users/:id/status`
- Manage and suspend user accounts.

---

## 3. Certificates Endpoints

### `POST /certificates`
- **Role**: `INSTITUTION_ISSUER`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `studentName`: string
  - `studentIdentifier`: string
  - `studentEmail`: string
  - `title`: string
  - `degree`: string
  - `department`: string
  - `issueDate`: ISO string
  - `file`: PDF binary (<= 10MB)
- **Response**: `201 Created` with Certificate details, generated ID, raw byte SHA-256, and initial `PENDING_BLOCKCHAIN` status.

### `GET /certificates`
- Scoped by user role:
  - `SUPER_ADMIN`: All certificates across system.
  - `INSTITUTION_ISSUER`: Certificates belonging only to issuer's institution.
  - `STUDENT`: Certificates belonging only to the student's email/identifier.

### `GET /certificates/:id`
- Retrieves comprehensive details for an authorized certificate.

### `POST /certificates/:id/revoke`
- **Role**: `INSTITUTION_ISSUER` or `SUPER_ADMIN`
- **Request Body**: `{ "reason": "Academic misconduct / administrative correction" }`
- Submits on-chain revocation transaction and emits real-time updates.

### `GET /certificates/:id/download`
- Authorized download of the official certificate PDF.

---

## 4. Verification Endpoints (Public)

### `GET /verify/:certificateId`
- Public lookup by certificate ID.
- Returns verified public metadata, document hash, on-chain transaction receipt, and status (`VERIFIED`, `REVOKED`, `PENDING_BLOCKCHAIN_CONFIRMATION`, `NOT_FOUND`).

### `POST /verify/upload`
- **Content-Type**: `multipart/form-data`
- **File**: `file` (PDF)
- Direct PDF integrity checking. Computes SHA-256 and compares strictly with database and blockchain. Returns `VERIFIED` or `TAMPERED`.

### `GET /verify/:certificateId/history`
- Public verification event history (anonymized timestamps and results).

---

## 5. Blockchain Telemetry

### `GET /blockchain/health`
- Returns status of Hardhat/EVM RPC node, current block number, contract address, and network name.

### `GET /blockchain/transactions`
- Paginated feed of smart contract registration and revocation transactions.

---

## 6. Fraud Analysis

### `POST /fraud/analyze`
- Analyzes candidate certificate payload and PDF metadata; returns 0–100 risk score and explainable rule trigger breakdown.

---

## 7. Analytics & Dashboard

### `GET /analytics/dashboard`
- Role-scoped KPI metrics: total certificates, confirmed on-chain, revoked, verifications, risk breakdown.
