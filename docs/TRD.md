# Technical Requirements Document (TRD) — CertiChain

## 1. Technical Stack Specifications

### 1.1 Frontend
- **Framework**: React 18 with Vite (TypeScript strict mode)
- **Styling**: Tailwind CSS (Tailwind v3+ with responsive design tokens)
- **Routing**: React Router v6
- **Server State**: TanStack Query v5 (React Query) with optimistic updates
- **Forms & Validation**: React Hook Form with Zod resolvers
- **Icons & Motion**: Lucide React, Framer Motion
- **Visualizations**: Recharts for dashboard analytics
- **WebSockets**: Socket.IO Client
- **QR Code**: `qrcode.react` (rendering) and `html5-qrcode` / browser scanner

### 1.2 Backend
- **Runtime**: Node.js 20+ (Node v24 compatible)
- **Framework**: Express with TypeScript
- **ORM**: Prisma ORM v5 / v6
- **Database**: PostgreSQL 16 (local Docker Compose or cloud instance; SQLite zero-config development fallback)
- **WebSockets**: Socket.IO server with JWT handshake authentication
- **Security & Middleware**: Helmet, CORS, Express-Rate-Limit, Multer (memory storage / streaming)
- **Cryptography**: Node.js native `crypto` module (SHA-256), `bcryptjs`
- **Validation**: Zod schema validation

### 1.3 Blockchain
- **Smart Contract Language**: Solidity `^0.8.28`
- **Development & Testing Suite**: Hardhat 2.22+ / 3.x with TypeScript
- **Client Library**: Ethers.js v6
- **Local Network**: Hardhat Network (`http://127.0.0.1:8545`, Chain ID: 31337)
- **Testnet Ready**: Polygon Amoy / Sepolia configurable via environment variables

---

## 2. Cryptographic Architecture

### 2.1 SHA-256 Hashing Pipeline
Raw byte hashing ensures that no formatting, layout, or font rendering variation corrupts the cryptographic fingerprint:
```
Uploaded PDF Buffer -> crypto.createHash('sha256').update(buffer).digest('hex')
```
- The resulting 64-character hexadecimal string is converted to `bytes32` for EVM storage:
  `"0x" + hashHex`
- **Tampering Detection**: Even a single altered byte, space, or metadata tag changes the SHA-256 digest completely due to the avalanche effect.

### 2.2 On-Chain Key Derivation
To prevent public leakage of certificate numbers while allowing deterministic lookups:
```solidity
bytes32 certKey = keccak256(abi.encodePacked(certificateId));
```

---

## 3. Smart Contract Architecture

The contract `CertificateRegistry.sol` is designed with minimal surface area and strict access control:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    enum CertificateStatus { Unregistered, Active, Revoked }

    struct CertificateRecord {
        bytes32 documentHash;
        address issuer;
        uint64 issuedAt;
        uint64 revokedAt;
        CertificateStatus status;
    }

    address public owner;
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => CertificateRecord) private certificates;

    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);
    event CertificateRegistered(bytes32 indexed certKey, bytes32 documentHash, address indexed issuer, uint64 issuedAt);
    event CertificateRevoked(bytes32 indexed certKey, address indexed issuer, uint64 revokedAt, string reason);

    // Modifiers & Functions: registerCertificate, revokeCertificate, getCertificate, verifyCertificate
}
```

---

## 4. Explainable Fraud Risk Engine

The rule-based fraud engine assigns transparent deductions/penalties to compute a 0–100 risk score:
- **Baseline**: 0 points (Low Risk / Authentic)
- **Hash Mismatch**: +80 points (Decisive tampering signal)
- **Unregistered Certificate ID**: +70 points (Unknown record)
- **Revoked Status**: +90 points (Invalidated document)
- **Suspicious Date Order** (Issue Date > Current Date or Graduation < Enrollment): +30 points
- **Unverified / Suspended Issuer**: +40 points
- **Unusual PDF Structure** (Missing standard PDF headers `%PDF-`, anomalous stream structure): +25 points

### Score Bands
- `0 - 20`: **Very Low Risk** (All cryptographic proofs and metadata verified)
- `21 - 40`: **Low Risk** (Authentic hash with minor metadata caveats)
- `41 - 60`: **Medium Risk** (Requires manual verification review)
- `61 - 80`: **High Risk** (Multiple anomalous factors detected)
- `81 - 100`: **Critical / High Fraud Risk** (Confirmed tampering or revocation)

---

## 5. Real-Time Socket.IO Protocol

| Event Name | Direction | Payload | Room Scope |
| :--- | :--- | :--- | :--- |
| `certificate:status` | Server -> Client | `{ certificateId, status, txHash }` | `institution_{id}` & `cert_{id}` |
| `blockchain:submitted` | Server -> Client | `{ certificateId, txHash, network }` | `institution_{id}` |
| `blockchain:confirmed` | Server -> Client | `{ certificateId, blockNumber, txHash }` | `institution_{id}` & `admin` |
| `blockchain:failed` | Server -> Client | `{ certificateId, error }` | `institution_{id}` |
| `certificate:revoked` | Server -> Client | `{ certificateId, revokedAt, reason }` | `institution_{id}`, `admin`, `cert_{id}` |
| `verification:completed` | Server -> Client | `{ certificateId, result, timestamp }` | `institution_{id}` & `admin` |
| `dashboard:stats-updated` | Server -> Client | `{ totalCertificates, active, revoked }` | `institution_{id}` & `admin` |
