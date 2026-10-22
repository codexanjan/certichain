# Comprehensive Test Plan — CertiChain

## 1. Test Strategy Overview
CertiChain adopts a multi-tiered test pyramid ensuring end-to-end cryptographic and business integrity:
1. **Unit Tests**: Cryptographic SHA-256 calculation, request schemas, risk score algorithms, key derivation.
2. **Smart Contract Tests**: Hardhat/Mocha suite verifying deployment, permissions, registration, duplicate protection, and revocation.
3. **Backend API Integration Tests**: Supertest suite testing auth, institutional approval, issuance, verification, tampering detection, and revocation.
4. **End-to-End Simulation**: Real browser-level and API workflow verification of the complete 5-minute judge demonstration.

---

## 2. Test Suites Matrix

### 2.1 Smart Contract Tests (`blockchain/test/CertificateRegistry.test.ts`)
| Test Case | Description | Expected Outcome |
| :--- | :--- | :--- |
| **SC-01** | Contract Deployment | Owner is deployer; zero registered certificates initially. |
| **SC-02** | Issuer Authorization | Owner can authorize and deauthorize issuers; events emitted. |
| **SC-03** | Unauthorized Registration | Non-authorized address attempting registration reverts with custom error. |
| **SC-04** | Valid Registration | Authorized issuer registers certificate; status becomes `Active`; event emitted. |
| **SC-05** | Duplicate Registration | Attempting to register identical `certKey` reverts with error. |
| **SC-06** | Certificate Lookup | `getCertificate` returns exact document hash, issuer address, and timestamps. |
| **SC-07** | Authorized Revocation | Issuer or owner can revoke; status transitions to `Revoked`. |
| **SC-08** | Unauthorized Revocation | Third-party address cannot revoke another issuer's certificate. |
| **SC-09** | Double Revocation | Revoking an already revoked certificate reverts. |

### 2.2 Backend & Cryptographic Tests (`backend/tests/`)
| Test Case | Description | Expected Outcome |
| :--- | :--- | :--- |
| **UT-01** | SHA-256 Consistency | Identical buffer produces identical hash; altered buffer produces completely different hash. |
| **UT-02** | Password Hashing | bcrypt hashes securely; invalid passwords rejected. |
| **UT-03** | Fraud Scoring Engine | Clean inputs yield score <= 20; altered hash yields score >= 80 with reasons. |
| **API-01** | Registration & Login | User registers, logs in, receives valid JWT access token and HttpOnly cookie. |
| **API-02** | RBAC Enforcement | Student attempting to call `/certificates` (POST) receives `403 Forbidden`. |
| **API-03** | Certificate Issuance | Issuer uploads valid PDF; backend saves file, generates ID, computes SHA-256, stores record. |
| **API-04** | Public Verification | Looking up valid ID returns status `VERIFIED` with on-chain metadata. |
| **API-05** | Tampering Detection | Uploading modified PDF with same ID returns status `TAMPERED` with hash mismatch details. |
| **API-06** | Revocation Handling | Revoking certificate updates database and blockchain; lookup returns status `REVOKED`. |

---

## 3. Test Fixtures Specifications
1. `valid-certificate.pdf`: Standard synthetic graduation certificate fixture.
2. `modified-certificate.pdf`: Single byte modified in text stream (guaranteed hash mismatch).
3. `invalid-format.txt`: Non-PDF payload to test MIME and magic-byte rejection.
4. `revoked-certificate.pdf`: Valid certificate that has been revoked on-chain.
