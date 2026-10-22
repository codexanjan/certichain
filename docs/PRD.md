# Product Requirements Document (PRD) — CertiChain

## 1. Executive Summary
**CertiChain** is an enterprise-grade digital credential platform delivering tamper-evident academic certificate issuance, blockchain-backed integrity verification, QR-code authentication, and explainable fraud risk detection. It solves credential fraud and the slow, manual verification workflows prevalent in hiring, admissions, and licensing.

---

## 2. Problem Statement
Academic credential fraud causes significant financial, reputational, and compliance liabilities for employers, educational boards, and background screening agencies:
1. **Pervasive Forgery**: Digitally altered PDFs (grades, degree titles, dates) are undetectable to the naked eye.
2. **Slow Manual Verification**: Employers wait 2–6 weeks for institutional registrar confirmation.
3. **Privacy Violations**: Centralized registries often publicly expose student PII or breach privacy regulations like GDPR/FERPA.
4. **Counterfeits & Diploma Mills**: Unaccredited entities issue fake credentials mimicking legitimate institutions.

---

## 3. Product Vision & Value Proposition
CertiChain establishes a decentralized cryptographic trust layer:
- **Zero-Knowledge Privacy**: Only cryptographic SHA-256 hashes and minimal non-sensitive keys exist on the blockchain. Sensitive PII and original certificates are kept in protected institutional storage.
- **Instant Independent Verification**: Anyone with a certificate ID or PDF can verify authenticity in <1 second against an immutable blockchain smart contract without manual registrar intervention.
- **Bi-Focal Fraud Architecture**: Clearly distinguishes mathematical integrity (blockchain hash match) from contextual anomalies (fraud risk analysis).

---

## 4. User Personas & Roles

### 4.1 Super Administrator
- **Persona**: Platform Governance Officer / Board Controller.
- **Responsibilities**: Vets and approves institutional applicants, monitors system health and blockchain transactions, conducts security audits, manages global revocation policies.

### 4.2 Institution / Issuer
- **Persona**: University Registrar, Examination Controller, Dean of Academic Records.
- **Responsibilities**: Manages registered students, issues authentic certificates, registers cryptographic proofs on the smart contract, initiates authorized revocations, tracks verification traffic.

### 4.3 Student / Graduate
- **Persona**: Academic recipient entering the workforce or pursuing higher education.
- **Responsibilities**: Accesses issued credentials, downloads secured official PDFs, generates and shares authenticated verification links and QR codes.

### 4.4 Public Verifier / Employer
- **Persona**: HR Recruiter, Background Verification Specialist, University Admissions Officer.
- **Responsibilities**: Validates applicant credentials by scanning QR codes, entering Certificate IDs, or uploading submitted PDF documents. Requires no login.

---

## 5. Functional Requirements Overview
- **FR-1: Institutional Onboarding & RBAC**: Multi-tiered role access control, cryptographic password hashing (bcrypt), JWT dual-token sessions (access + HTTP-only refresh).
- **FR-2: Certificate Issuance & Cryptographic Hashing**: Raw byte-level SHA-256 computation, persistent database record creation, unique non-enumerable certificate ID generation.
- **FR-3: Blockchain Registry Smart Contract**: Minimalist, auditable Solidity contract on an EVM-compatible chain storing certificate identifiers, document hashes, issuer addresses, and status flags.
- **FR-4: Real-Time Transaction Engine**: Asynchronous transaction submission, receipt monitoring, WebSocket status broadcasting, and resilient crash recovery.
- **FR-5: Multi-Modal Public Verification**: Verification via URL/QR, Certificate ID lookup, and direct PDF upload comparison.
- **FR-6: Six Definitive Verification States**:
  1. `VERIFIED`: Exact hash match, valid registered issuer, active on-chain status.
  2. `TAMPERED`: Certificate ID found, but uploaded file hash differs from the registered cryptographic proof.
  3. `REVOKED`: Certificate was explicitly invalidated by its issuing institution.
  4. `NOT FOUND`: No record exists on the registry (unverified, not automatically fraudulent).
  5. `PENDING BLOCKCHAIN CONFIRMATION`: Transaction submitted to mempool, awaiting block inclusion.
  6. `BLOCKCHAIN VERIFICATION UNAVAILABLE`: RPC or network partition detected; system safely degrades without false affirmations.
- **FR-7: Explainable Rule-Based Fraud Detection**: Distinct 0–100 risk score based on transparent heuristics (structural mismatch, metadata anomalies, unauthorized issuer, date inconsistency).
- **FR-8: Enterprise Analytics & Audit Logging**: Real-time telemetry, verification geo/temporal heatmaps, and tamper-evident audit trails.

---

## 6. Success Metrics & KPIs
1. **Verification Latency**: < 800ms for QR/ID verification; < 1.5s for PDF byte re-hashing and on-chain lookup.
2. **Zero False Positives**: 100% detection of byte-level PDF alterations.
3. **Data Privacy Compliance**: 0 bytes of student PII written to public blockchain storage.
4. **System Reliability**: Resilient recovery of pending blockchain transactions upon backend restart.
