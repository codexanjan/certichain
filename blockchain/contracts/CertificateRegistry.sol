// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title CertificateRegistry
 * @dev Secure, minimalist, tamper-evident registry for academic certificate cryptographic proofs.
 * Stores only fixed-size hashes (bytes32) and metadata. Zero student PII on-chain.
 */
contract CertificateRegistry {
    enum CertificateStatus {
        Unregistered, // 0: Does not exist in registry
        Active,       // 1: Authentic, active, and verified
        Revoked       // 2: Explicitly invalidated by issuing institution
    }

    struct CertificateRecord {
        bytes32 documentHash;     // SHA-256 hash of raw certificate PDF
        address issuer;           // Wallet address of authorized issuer
        uint64 issuedAt;          // Unix timestamp of registration
        uint64 revokedAt;         // Unix timestamp of revocation (0 if active)
        CertificateStatus status; // Current status
    }

    address public owner;
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => CertificateRecord) private certificates;

    // Events
    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);
    event CertificateRegistered(
        bytes32 indexed certKey,
        bytes32 documentHash,
        address indexed issuer,
        uint64 issuedAt
    );
    event CertificateRevoked(
        bytes32 indexed certKey,
        address indexed issuer,
        uint64 revokedAt,
        string reason
    );

    // Custom Errors for gas efficiency
    error OnlyOwner();
    error OnlyAuthorizedIssuer();
    error OnlyIssuerOrOwner();
    error InvalidKey();
    error InvalidHash();
    error InvalidIssuerAddress();
    error CertificateAlreadyRegistered();
    error CertificateNotActive();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner) {
            revert OnlyAuthorizedIssuer();
        }
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    /**
     * @dev Authorize an institution's wallet address to issue certificates.
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        if (issuer == address(0)) revert InvalidIssuerAddress();
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    /**
     * @dev Deauthorize an institution's wallet address.
     */
    function deauthorizeIssuer(address issuer) external onlyOwner {
        if (issuer == address(0)) revert InvalidIssuerAddress();
        authorizedIssuers[issuer] = false;
        emit IssuerDeauthorized(issuer);
    }

    /**
     * @dev Check if an address is authorized to issue certificates.
     */
    function isIssuerAuthorized(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer];
    }

    /**
     * @dev Register a new certificate proof on-chain.
     * @param certKey keccak256 hash of the unique certificate ID
     * @param documentHash SHA-256 cryptographic hash of the exact certificate PDF bytes
     */
    function registerCertificate(
        bytes32 certKey,
        bytes32 documentHash
    ) external onlyAuthorizedIssuer {
        if (certKey == bytes32(0)) revert InvalidKey();
        if (documentHash == bytes32(0)) revert InvalidHash();
        if (certificates[certKey].status != CertificateStatus.Unregistered) {
            revert CertificateAlreadyRegistered();
        }

        uint64 currentTime = uint64(block.timestamp);
        certificates[certKey] = CertificateRecord({
            documentHash: documentHash,
            issuer: msg.sender,
            issuedAt: currentTime,
            revokedAt: 0,
            status: CertificateStatus.Active
        });

        emit CertificateRegistered(certKey, documentHash, msg.sender, currentTime);
    }

    /**
     * @dev Revoke an existing active certificate.
     * Only the original issuer or contract owner can revoke.
     */
    function revokeCertificate(
        bytes32 certKey,
        string calldata reason
    ) external {
        CertificateRecord storage record = certificates[certKey];
        if (record.status != CertificateStatus.Active) {
            revert CertificateNotActive();
        }
        if (msg.sender != record.issuer && msg.sender != owner) {
            revert OnlyIssuerOrOwner();
        }

        uint64 currentTime = uint64(block.timestamp);
        record.status = CertificateStatus.Revoked;
        record.revokedAt = currentTime;

        emit CertificateRevoked(certKey, msg.sender, currentTime, reason);
    }

    /**
     * @dev Check if a certificate key is registered in the contract.
     */
    function certificateExists(bytes32 certKey) external view returns (bool) {
        return certificates[certKey].status != CertificateStatus.Unregistered;
    }

    /**
     * @dev Retrieve complete on-chain record for a certificate key.
     */
    function getCertificate(bytes32 certKey)
        external
        view
        returns (
            bytes32 documentHash,
            address issuer,
            uint64 issuedAt,
            uint64 revokedAt,
            CertificateStatus status
        )
    {
        CertificateRecord memory record = certificates[certKey];
        return (
            record.documentHash,
            record.issuer,
            record.issuedAt,
            record.revokedAt,
            record.status
        );
    }

    /**
     * @dev Single-call verification helper.
     * Compares candidate hash with registered hash and checks status.
     */
    function verifyCertificate(bytes32 certKey, bytes32 candidateHash)
        external
        view
        returns (
            bool isValid,
            bool isTampered,
            bool isRevoked,
            uint64 issuedAt
        )
    {
        CertificateRecord memory record = certificates[certKey];

        if (record.status == CertificateStatus.Unregistered) {
            return (false, false, false, 0);
        }

        if (record.status == CertificateStatus.Revoked) {
            return (false, false, true, record.issuedAt);
        }

        if (record.documentHash != candidateHash) {
            return (false, true, false, record.issuedAt);
        }

        // Active and matching hash
        return (true, false, false, record.issuedAt);
    }
}
