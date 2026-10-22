# Viva & Project Defense Guide — CertiChain

## 1. Core Architectural Questions

### Q1: Why do you need a blockchain? Why not a standard centralized database?
**Answer**:
A centralized database (e.g. MySQL, PostgreSQL) has a single point of administrative control. An internal database administrator or an attacker with compromised server credentials can alter records, manipulate issue dates, or delete revocations without leaving an immutable audit trail.
By registering the certificate's cryptographic SHA-256 hash on an EVM blockchain smart contract:
1. **Immutability**: Once recorded in a mined block, the cryptographic proof cannot be altered or deleted by anyone—not even the CertiChain system administrators.
2. **Decentralized Verifiability**: Employers and external verifiers can check the smart contract state independently via any public RPC node, without placing blind faith in CertiChain's internal servers.
3. **Non-repudiation**: The transaction is cryptographically signed by the issuing institution's private key, proving who issued it and when.

---

### Q2: Why don't you store the certificate PDF or student details directly on the blockchain?
**Answer**:
Storing raw documents or personal data on a public blockchain has severe flaws:
1. **Privacy & Legal Compliance (GDPR/FERPA)**: Blockchain data is public and permanent. Storing student PII violates the "Right to be Forgotten" and privacy regulations.
2. **Cost & Scalability**: Storing a 2 MB PDF directly in Ethereum/EVM contract storage would cost thousands of dollars in gas and cause bloat.
3. **Solution**: We store only a **32-byte SHA-256 cryptographic hash** and a **derived `bytes32` certificate key** on-chain. This provides mathematical integrity proof while keeping all student PII strictly private.

---

### Q3: What happens if a single byte in the certificate PDF is altered?
**Answer**:
Due to the **avalanche effect** of the SHA-256 cryptographic hashing algorithm, altering even a single character, pixel, or hidden metadata tag completely transforms the resulting 256-bit hash digest.
When a verifier uploads a modified PDF:
1. The backend hashes the raw uploaded bytes.
2. The hash is compared to the registered on-chain hash.
3. Because `hash(modified) != hash(registered)`, CertiChain flags the document as **`TAMPERED`** with 100% mathematical certainty.

---

### Q4: How is fraud detection different from blockchain verification?
**Answer**:
They operate at two distinct conceptual layers:
- **Blockchain Verification** answers: *"Does this digital file exactly match the cryptographic proof registered by an authorized issuer, and is its status active?"* (Binary, mathematical proof).
- **Fraud Risk Analysis** answers: *"Does this document or its metadata contain suspicious characteristics or anomalies that warrant closer human review?"* (Heuristic/risk evaluation, scoring 0–100).
Even if a document is not yet registered (producing `NOT FOUND`), it might not be a malicious forgery; conversely, an authentic certificate might have metadata discrepancies. Keeping these layers distinct prevents false accusations while providing actionable intelligence.

---

### Q5: How does the system handle blockchain latency or network downtime?
**Answer**:
1. **Asynchronous Transaction Pipeline**: Issuance immediately persists the record in PostgreSQL with status `PENDING_BLOCKCHAIN`, returns a receipt, and uses a background worker to submit and monitor the on-chain transaction receipt.
2. **Real-Time Push Notifications**: WebSocket events (`blockchain:submitted`, `blockchain:confirmed`) update the UI automatically without page reload once the transaction is mined.
3. **Graceful Degradation**: If the blockchain RPC is unreachable during public verification, CertiChain explicitly returns `BLOCKCHAIN VERIFICATION UNAVAILABLE` instead of falsely claiming the certificate is verified or tampered.
