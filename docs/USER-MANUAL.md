# User Manual — CertiChain

## 1. Landing Page & Navigation
- Visit `http://localhost:5173/`.
- The top navigation bar provides links to:
  - **Features**: Detailed breakdown of cryptographic hashing and blockchain integrity.
  - **How It Works**: Visual 4-step lifecycle (Issue -> Hash -> Register -> Verify).
  - **Verify Certificate**: Instant access to public verification.
  - **Sign In / Get Started**: Access to role-based portals.
- The hero section includes an interactive quick verification lookup widget.

---

## 2. Institutional Issuance Flow
1. **Sign In**:
   - Navigate to `/login`.
   - Log in with institution credentials (e.g. `issuer@mit.edu` / `Password123!`).
2. **Issue New Certificate**:
   - Click **Issue Certificate** in the sidebar.
   - Enter student details: Student Name, Roll/Registration Number, Degree, Program, and Issue Date.
   - Attach the official certificate PDF file.
   - Click **Issue & Register on Blockchain**.
3. **Real-Time Progress**:
   - Observe the live timeline:
     - Document uploaded ✓
     - Raw byte SHA-256 computed ✓
     - Database record created ✓
     - Blockchain transaction submitted (displays txHash)
     - Block confirmation received ✓
4. **Download & Share**:
   - The certificate is immediately accessible in the certificate directory with its unique QR code and public verification link.

---

## 3. Public Verification Flow
1. **Method A: Direct ID Lookup**:
   - Navigate to `/verify`.
   - Enter the Certificate ID (e.g. `CERT-2026-00123`) and click **Verify**.
2. **Method B: Scan QR Code**:
   - Click **Scan QR** and allow camera permissions or upload a QR image.
   - The system automatically navigates to `/verify/:certificateId`.
3. **Method C: PDF Document Upload**:
   - Drag and drop or upload any candidate certificate PDF.
   - The platform calculates its SHA-256 in real-time and validates it against the on-chain registry.
4. **Interpreting Results**:
   - `VERIFIED`: The file matches the cryptographic record on the blockchain and is active.
   - `TAMPERED`: The document hash differs from the registered record.
   - `REVOKED`: The certificate has been invalidated by its institution.
   - `NOT FOUND`: No matching certificate record was discovered.

---

## 4. Super Admin Management
1. Log in with Super Admin credentials (`admin@certichain.io` / `AdminSecret2026!`).
2. Navigate to `/admin/applications` to review and approve institutional applicants.
3. Navigate to `/admin/blockchain` to inspect real-time transaction receipts and smart contract telemetry.
4. Navigate to `/admin/audit` to review chronological audit logs.
