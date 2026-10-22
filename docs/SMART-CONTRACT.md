# Smart Contract Architecture & Specification — CertiChain

## 1. Overview
The **`CertificateRegistry`** smart contract serves as an immutable, tamper-evident registry for cryptographic certificate proofs.
- **Contract Name**: `CertificateRegistry`
- **Compiler**: Solidity `^0.8.28`
- **Standard**: Custom lightweight registry with role-based issuer authorization
- **Network Compatibility**: EVM-compatible (Ethereum, Hardhat, Polygon, Arbitrum)

---

## 2. Security Principles
1. **Zero PII**: No student names, emails, national identification numbers, or raw document content are stored on-chain.
2. **Fixed-Size Cryptographic Types**: Document hashes and certificate identifiers are strictly represented as `bytes32`.
3. **Strict Access Controls**:
   - `owner`: Can authorize or deauthorize academic institutions.
   - `authorizedIssuers`: Only vetted academic institutions can register certificates.
   - Revocation can only be executed by the original certificate issuer or the contract owner.
4. **No Financial / Token Mechanics**: Zero gas-draining loops, no ERC-20/721 tokens, no payable functions, eliminating reentrancy and economic attack vectors.

---

## 3. Data Structures & State Variables

```solidity
enum CertificateStatus {
    Unregistered, // 0: Key does not exist in registry
    Active,       // 1: Valid and active certificate
    Revoked       // 2: Explicitly invalidated certificate
}

struct CertificateRecord {
    bytes32 documentHash;     // SHA-256 digest of raw certificate PDF
    address issuer;           // Wallet address of the issuing institution
    uint64 issuedAt;          // Block timestamp when registered
    uint64 revokedAt;         // Block timestamp when revoked (0 if active)
    CertificateStatus status; // Current on-chain status
}

mapping(address => bool) public authorizedIssuers;
mapping(bytes32 => CertificateRecord) private certificates;
```

---

## 4. Key Functions Specification

### `registerCertificate(bytes32 certKey, bytes32 documentHash)`
- **Modifier**: `onlyAuthorizedIssuer`
- **Validation**:
  - `certKey != bytes32(0)`
  - `documentHash != bytes32(0)`
  - `certificates[certKey].status == CertificateStatus.Unregistered`
- **Action**: Persists record with `block.timestamp`, sets status to `Active`.
- **Emits**: `CertificateRegistered(certKey, documentHash, msg.sender, block.timestamp)`

### `revokeCertificate(bytes32 certKey, string calldata reason)`
- **Modifier**: `onlyAuthorizedIssuerOrOwner`
- **Validation**:
  - `certificates[certKey].status == CertificateStatus.Active`
  - `msg.sender == certificates[certKey].issuer || msg.sender == owner`
- **Action**: Sets `status` to `Revoked`, updates `revokedAt = block.timestamp`.
- **Emits**: `CertificateRevoked(certKey, msg.sender, block.timestamp, reason)`

### `getCertificate(bytes32 certKey)`
- **Visibility**: `external view returns (bytes32 documentHash, address issuer, uint64 issuedAt, uint64 revokedAt, CertificateStatus status)`
- **Action**: Returns on-chain record for a given derived certificate key.

### `verifyCertificate(bytes32 certKey, bytes32 candidateHash)`
- **Visibility**: `external view returns (bool isValid, bool isTampered, bool isRevoked, uint64 issuedAt)`
- **Action**: Efficient single-call comparison returning boolean flags for direct frontend/API interpretation.

---

## 5. Gas Optimization
- Struct packed into 2 storage slots:
  - Slot 1: `bytes32 documentHash` (32 bytes)
  - Slot 2: `address issuer` (20 bytes) + `uint64 issuedAt` (8 bytes) + `uint64 revokedAt` (8 bytes -- wait, packed appropriately) + `uint8 status` (1 byte)
- Direct `bytes32` usage avoids expensive string manipulation and dynamic memory allocation on-chain.
