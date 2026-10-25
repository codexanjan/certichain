<p align="center">
  <img src="docs/logo.png" alt="CertiChain Logo" width="140" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,242,254,0.2);" />
</p>

# CertiChain 🛡️
### Enterprise Blockchain Academic Certificate Verification & Cryptographic Fraud Detection

[![Live Production](https://img.shields.io/badge/Production-certichain--platform.vercel.app-00F2FE?style=for-the-badge&logo=vercel&logoColor=black)](https://certichain-platform.vercel.app)
[![Vercel Mirror](https://img.shields.io/badge/Vercel_Mirror-certichain--seven.vercel.app-6366F1?style=for-the-badge&logo=vercel&logoColor=white)](https://certichain-seven.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-codexanjan%2Fcertichain-10B981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/codexanjan/certichain)
[![Tests Passing](https://img.shields.io/badge/Tests-37%2F37_Passing-brightgreen?style=for-the-badge)](https://github.com/codexanjan/certichain)

> 🚀 **Live Production Platform**: [https://certichain-platform.vercel.app](https://certichain-platform.vercel.app)  
> 🌐 **Vercel Edge Mirror**: [https://certichain-seven.vercel.app](https://certichain-seven.vercel.app)  
> 📦 **GitHub Repository**: [https://github.com/codexanjan/certichain](https://github.com/codexanjan/certichain)

---

## 🎨 Interactive Platform Showcase

<p align="center">
  <img src="docs/ui-showcase.svg" alt="CertiChain UI Verification Console" width="100%" />
</p>

---

## 1. Product Overview & Vision
**CertiChain** is an enterprise-grade digital credential platform solving academic certificate fraud, forgery, and slow manual registrar verification. 

By combining **cryptographic SHA-256 byte-level hashing**, **EVM smart contract immutability**, **dynamic QR codes**, and **explainable rule-based fraud risk analysis**, CertiChain delivers sub-second, decentralized verification while guaranteeing **Zero PII on public blockchains**.

<p align="center">
  <img src="docs/architecture-flow.svg" alt="CertiChain Platform Architecture" width="100%" />
</p>

---

## 2. Technology Stack

### Blockchain Layer
- **Smart Contract Language**: Solidity `^0.8.28`
- **Development & Test Framework**: Hardhat
- **Client Library**: Ethers.js v6
- **Contract Name**: `CertificateRegistry` (Deployed to local Hardhat devnet and testnet-ready)
- **Zero PII**: Only `bytes32` derived certificate keys, `bytes32` document hashes, issuer addresses, and timestamps exist on-chain.

### Backend Layer
- **Runtime**: Node.js 20+ (Node v24 tested)
- **Framework**: Express with TypeScript
- **ORM & Database**: Prisma ORM with PostgreSQL (and zero-config local development SQLite mode)
- **Real-Time Communication**: Socket.IO with authenticated room-scoping
- **Security**: Helmet, Express Rate Limit, Cookie-Parser, Multer with magic-byte (`%PDF-`) verification, bcrypt password hashing, and dual-token JWT sessions.

### Frontend Layer
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS & Obsidian Cyberpunk Glassmorphism Design System
- **Animation**: GSAP Cinematic Timelines, Framer Motion, Canvas Confetti
- **Routing**: React Router v6 with Role-Based Access Guards
- **State Management**: TanStack Query v5 (React Query)
- **Icons & Motion**: Lucide React, Framer Motion
- **QR Engine**: `qrcode.react` (generation) & `html5-qrcode`

---

## 3. Seed Demo Credentials (1-Click Login)
For rapid viva evaluation and testing, the database and simulation engine include pre-seeded credentials:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@certichain.io` | `AdminSecret2026!` | Global governance, application approvals, blockchain audit |
| **MIT Issuer** | `issuer@mit.edu` | `Password123!` | Issues & revokes certificates for MIT |
| **Stanford Issuer** | `issuer@stanford.edu` | `Password123!` | Issues & revokes certificates for Stanford |
| **Student** | `anjan@student.mit.edu` | `Password123!` | Credential wallet & authorized PDF download |
| **Public Verifier** | *No account required* | *N/A* | Public verification via `/verify` |

*Pre-seeded verified certificate for instant testing:* **`CERT-2026-000123`**

---

## 4. Key Verification States & Semantics

| Status | Cryptographic & System Reality | User Message |
| :--- | :--- | :--- |
| **`VERIFIED`** | Uploaded file hash matches registered on-chain hash and status is `Active`. | "The document matches the registered record and is authentic and active." |
| **`TAMPERED`** | Uploaded file hash differs from the registered cryptographic proof. | "The uploaded document has been modified or altered. Its hash does not match." |
| **`REVOKED`** | Certificate was explicitly invalidated on-chain by the issuing institution. | "This certificate was issued previously but has been formally revoked." |
| **`NOT_FOUND`** | No certificate record matches the ID or submitted document hash. | "No matching certificate record was found. (Does not prove fraud by itself)." |
| **`PENDING`** | Record saved in database; blockchain transaction awaiting block inclusion. | "The certificate is pending blockchain block confirmation." |
| **`CHAIN UNAVAILABLE`** | RPC node or network is unreachable; system safely degrades. | "Could not verify the blockchain record at this time. Please try again later." |

---

## 5. Five-Minute Viva Demonstration Script

1. **Minute 1 — Problem & Landing Page**:
   - Open [https://certichain-platform.vercel.app](https://certichain-platform.vercel.app).
   - Click the **"Fill Genuine Demo"** pill or enter `CERT-2026-000123`.
   - Click **"Verify on Chain ⚡"**.
   - Notice the instant verification, confetti animation, smooth scroll to the full cryptographic audit report, SHA-256 match, EVM transaction hash, and 0/100 risk score.
2. **Minute 2 — Institutional Issuance**:
   - Sign in as `issuer@mit.edu` / `Password123!` (or click the 1-Click Fast-Fill on the Login page).
   - Click **Issue New Certificate**. Fill student details and attach a test PDF.
   - Observe live real-time timeline (Upload -> SHA-256 calculation -> Database persistence -> Blockchain transaction submitted -> Confirmed in block).
3. **Minute 3 — Public Verification & QR Code**:
   - Open `/verify`. Scan the generated QR code or enter the Certificate ID.
   - Show the matching SHA-256 hash digest, blockchain transaction hash, and active verification badge.
4. **Minute 4 — Tamper Detection Demonstration**:
   - On the verification console, enter a tampered ID (e.g. `CERT-TAMPERED-001` or upload an altered document).
   - Observe the immediate **`TAMPERED ⚠`** outcome with rule-based fraud risk score > 80 due to the cryptographic avalanche effect.
5. **Minute 5 — Revocation & Zero-PII Defense**:
   - From the MIT Issuer dashboard, click **Revoke** on the certificate with an academic reason.
   - Refresh or re-verify the certificate: state immediately turns to **`REVOKED ✗`**.
   - Conclude with the core academic defense: *"CertiChain does not store student PII on-chain; it writes only an immutable mathematical proof, complying fully with GDPR/FERPA while providing trustless verifiability."*

---

## 6. Local Development Startup

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker (optional; SQLite fallback works out of the box)

### Installation & Execution
```bash
# 1. Clone repository
git clone <repo-url> certichain
cd certichain

# 2. Install workspace dependencies
npm install

# 3. Start local Hardhat EVM blockchain (Terminal 1)
npm run node:chain

# 4. Deploy smart contract to local chain (Terminal 2)
npm run deploy:contract

# 5. Run Prisma migrations and seed demo data
npm run db:migrate
npm run db:seed

# 6. Start full stack development servers (Terminal 3)
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api/v1`
- **Socket.IO Real-Time Server**: `http://localhost:5000`

---

## 7. Testing Suites Summary

CertiChain features comprehensive automated test suites:

```bash
npm run test
```

- **Smart Contract Tests** (`blockchain/test/CertificateRegistry.test.ts`):
  - 17/17 tests passing (Deployment, authorization, registration, duplicate checks, verification helper, revocation, access controls).
- **Backend API & Cryptography Tests** (`backend/tests/`):
  - 20/20 tests passing (SHA-256 byte consistency, avalanche effect, fraud scoring, registration, login, public verification, tampering detection, revocation, and RBAC 403 enforcement).
- **Total Test Coverage**: **37 passing tests (100% success rate)**.
