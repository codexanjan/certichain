import { ethers } from "ethers";
import { config } from "../../config";
import { logger } from "../../utils/logger";
import { hashToBytes32 } from "../../utils/crypto";

// Minimal ABI for CertificateRegistry
const CERTIFICATE_REGISTRY_ABI = [
  "function registerCertificate(bytes32 certKey, bytes32 documentHash) external",
  "function revokeCertificate(bytes32 certKey, string calldata reason) external",
  "function getCertificate(bytes32 certKey) external view returns (bytes32 documentHash, address issuer, uint64 issuedAt, uint64 revokedAt, uint8 status)",
  "function verifyCertificate(bytes32 certKey, bytes32 candidateHash) external view returns (bool isValid, bool isTampered, bool isRevoked, uint64 issuedAt)",
  "function certificateExists(bytes32 certKey) external view returns (bool)",
  "function isIssuerAuthorized(address issuer) external view returns (bool)",
  "function authorizeIssuer(address issuer) external",
  "event CertificateRegistered(bytes32 indexed certKey, bytes32 documentHash, address indexed issuer, uint64 issuedAt)",
  "event CertificateRevoked(bytes32 indexed certKey, address indexed issuer, uint64 revokedAt, string reason)"
];

export interface OnChainRecord {
  documentHash: string;
  issuer: string;
  issuedAt: number;
  revokedAt: number;
  status: number; // 0 = Unregistered, 1 = Active, 2 = Revoked
}

export interface VerificationOnChainResult {
  isValid: boolean;
  isTampered: boolean;
  isRevoked: boolean;
  issuedAt: number;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private isConnected = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.BLOCKCHAIN_RPC_URL, undefined, {
      staticNetwork: true,
    });
    this.wallet = new ethers.Wallet(config.BLOCKCHAIN_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      config.CONTRACT_ADDRESS,
      CERTIFICATE_REGISTRY_ABI,
      this.wallet
    );
  }

  /**
   * Health check verifying RPC and contract accessibility.
   */
  async checkHealth(): Promise<{
    connected: boolean;
    network: string;
    blockNumber: number;
    contractAddress: string;
  }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      this.isConnected = true;
      return {
        connected: true,
        network: config.BLOCKCHAIN_NETWORK,
        blockNumber,
        contractAddress: config.CONTRACT_ADDRESS,
      };
    } catch (error) {
      this.isConnected = false;
      logger.warn("Blockchain RPC unreachable or contract uninitialized", {
        rpcUrl: config.BLOCKCHAIN_RPC_URL,
        error: error instanceof Error ? error.message : error,
      });
      return {
        connected: false,
        network: config.BLOCKCHAIN_NETWORK,
        blockNumber: 0,
        contractAddress: config.CONTRACT_ADDRESS,
      };
    }
  }

  /**
   * Submits a certificate registration transaction to the smart contract.
   */
  async registerCertificate(
    certKey: string,
    documentHashHex: string
  ): Promise<{ txHash: string; blockNumber: number }> {
    try {
      const formattedDocHash = hashToBytes32(documentHashHex);
      logger.info("Submitting registration transaction to smart contract", {
        certKey,
        documentHash: formattedDocHash,
      });

      const tx = await this.contract.registerCertificate(certKey, formattedDocHash);
      logger.info("Registration transaction submitted", { txHash: tx.hash });

      const receipt = await tx.wait(1);
      logger.info("Registration transaction confirmed in block", {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      });

      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error("Smart contract registration failed", {
        certKey,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Submits a certificate revocation transaction to the smart contract.
   */
  async revokeCertificate(
    certKey: string,
    reason: string
  ): Promise<{ txHash: string; blockNumber: number }> {
    try {
      logger.info("Submitting revocation transaction to smart contract", {
        certKey,
        reason,
      });

      const tx = await this.contract.revokeCertificate(certKey, reason);
      const receipt = await tx.wait(1);

      logger.info("Revocation transaction confirmed in block", {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      });

      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error("Smart contract revocation failed", {
        certKey,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Queries on-chain record for a derived certificate key.
   */
  async getCertificate(certKey: string): Promise<OnChainRecord | null> {
    try {
      const exists = await this.contract.certificateExists(certKey);
      if (!exists) return null;

      const record = await this.contract.getCertificate(certKey);
      return {
        documentHash: record[0],
        issuer: record[1],
        issuedAt: Number(record[2]),
        revokedAt: Number(record[3]),
        status: Number(record[4]),
      };
    } catch (error) {
      logger.error("Failed to query on-chain certificate record", {
        certKey,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Calls contract verifyCertificate helper function.
   */
  async verifyOnChain(
    certKey: string,
    candidateHashHex: string
  ): Promise<VerificationOnChainResult> {
    try {
      const formattedCandidateHash = hashToBytes32(candidateHashHex);
      const res = await this.contract.verifyCertificate(certKey, formattedCandidateHash);
      return {
        isValid: res[0],
        isTampered: res[1],
        isRevoked: res[2],
        issuedAt: Number(res[3]),
      };
    } catch (error) {
      logger.error("On-chain verification query failed", {
        certKey,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();
