# Security Architecture & Hardening — CertiChain

## 1. Threat Model & Mitigations

| Threat Vector | Potential Impact | CertiChain Defense Mechanism |
| :--- | :--- | :--- |
| **PDF Visual Forgery** | Altered grades or names presented to employers | Raw byte SHA-256 recalculation strictly compared against blockchain immutable hash. |
| **Blockchain PII Leakage** | Violation of GDPR/FERPA by publicly exposing student data | Zero PII stored on-chain. Only non-sensitive cryptographic hashes and keys are broadcast. |
| **Private Key Exposure** | Unauthorized certificate issuance under institutional identity | Private keys isolated to server environment variables; never exposed to frontend; dedicated dev/test accounts. |
| **Unauthorized File Download** | Snooping on student certificates | Storage adapter enforces server-side role check; no publicly readable asset directory. |
| **Replay & Tampering Attacks** | Re-registering existing certificates | Smart contract reverts on duplicate `certKey`; unique non-enumerable certificate IDs. |
| **Brute Force / Enumeration** | Account compromise and ID guessing | Tiered IP and account rate limiting; non-sequential cryptographic UUIDs and random IDs. |
| **XSS & Injection** | Frontend execution or database corruption | Strict input validation with Zod, parameterized queries via Prisma ORM, Helmet security headers, HTML entity escaping. |

---

## 2. Cryptographic Storage & Session Policies
- **Passwords**: Hashed with `bcryptjs` using a minimum work factor of 12.
- **Access Tokens**: Short-lived (15 minutes), signed with `HS256`, strictly transmitted via `Authorization: Bearer <token>`.
- **Refresh Tokens**: Long-lived (7 days), stored hashed in PostgreSQL, transmitted solely via `HttpOnly`, `SameSite: Lax/Strict`, `Secure` (in production) cookies.
- **Key Derivation**: Certificate on-chain keys are derived via standard Keccak-256 of the certificate identifier.

---

## 3. Upload File Hardening
- **Size Limit**: Maximum 10 MB per file.
- **Magic Bytes Validation**: Validates that every uploaded file begins with `%PDF-` (`0x25 0x50 0x44 0x46`) to prevent polyglot or executable file masquerading.
- **Storage Isolation**: Uploaded files are stored in restricted directories with randomly generated storage keys, preventing path traversal attacks.
