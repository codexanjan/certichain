import { prisma } from "../../utils/db";
import { logger } from "../../utils/logger";
import { calculateSha256, anonymizeIp } from "../../utils/crypto";
import { blockchainService } from "../blockchain/blockchain.service";
import { fraudDetectionService, FraudAnalysisResult } from "../fraud/fraud.service";
import { socketManager } from "../../sockets/socket.manager";

export type VerificationStatus =
  | "VERIFIED"
  | "TAMPERED"
  | "REVOKED"
  | "NOT_FOUND"
  | "PENDING_BLOCKCHAIN_CONFIRMATION"
  | "BLOCKCHAIN_VERIFICATION_UNAVAILABLE";

export interface VerificationResponse {
  status: VerificationStatus;
  message: string;
  certificateId?: string;
  certificate?: {
    id: string;
    certificateId: string;
    title: string;
    degree: string;
    department?: string | null;
    issueDate: Date;
    institutionName: string;
    institutionCode: string;
    studentName: string;
    documentSha256: string;
    txHash?: string | null;
    blockNumber?: number | null;
    revokedAt?: Date | null;
    revocationReason?: string | null;
  };
  integrity: {
    hashMatched: boolean;
    registeredHash?: string;
    submittedHash?: string;
  };
  blockchain: {
    checked: boolean;
    confirmedOnChain: boolean;
    network: string;
    contractAddress?: string;
    txHash?: string | null;
  };
  fraudRisk: FraudAnalysisResult;
  verifiedAt: string;
}

export class VerificationService {
  /**
   * Public verification by Certificate ID.
   */
  async verifyByCertificateId(
    certificateId: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationResponse> {
    const verifiedAt = new Date().toISOString();
    const ipHash = clientIp ? anonymizeIp(clientIp) : null;

    // 1. Look up certificate in database
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        institution: true,
        studentProfile: true,
      },
    });

    // Case: NOT FOUND
    if (!cert) {
      await prisma.verificationRecord.create({
        data: {
          verificationType: "CERTIFICATE_ID",
          result: "NOT_FOUND",
          ipHash,
          userAgent,
        },
      });

      const fraudRisk = fraudDetectionService.evaluate({
        certificateFound: false,
        hashMatched: false,
        isRevoked: false,
        certificateId,
      });

      return {
        status: "NOT_FOUND",
        message: "No matching certificate record was found. This result does not, by itself, prove fraud.",
        certificateId,
        integrity: { hashMatched: false },
        blockchain: { checked: false, confirmedOnChain: false, network: "hardhat" },
        fraudRisk,
        verifiedAt,
      };
    }

    // 2. Query Blockchain
    let onChainChecked = false;
    let onChainValid = false;
    let onChainRevoked = false;
    let onChainError = false;

    try {
      const health = await blockchainService.checkHealth();
      if (!health.connected) {
        onChainError = true;
      } else {
        const onChainResult = await blockchainService.getCertificate(cert.onChainKey);
        onChainChecked = true;
        if (onChainResult) {
          if (onChainResult.status === 1) onChainValid = true;
          if (onChainResult.status === 2) onChainRevoked = true;
        }
      }
    } catch (err) {
      logger.warn("Blockchain query error during verification", { certificateId, error: (err as Error).message });
      onChainError = true;
    }

    // 3. Resolve State Precedence
    let status: VerificationStatus = "VERIFIED";
    let message = "The document matches the registered record and is authentic and active.";

    if (cert.status === "REVOKED" || onChainRevoked) {
      status = "REVOKED";
      message = "This certificate was issued previously but has been formally revoked by its issuing authority.";
    } else if (cert.status === "PENDING_BLOCKCHAIN" && !onChainValid) {
      status = "PENDING_BLOCKCHAIN_CONFIRMATION";
      message = "The certificate record exists, but its blockchain registration transaction is still pending confirmation.";
    } else if (onChainError) {
      status = "BLOCKCHAIN_VERIFICATION_UNAVAILABLE";
      message = "The system could not verify the blockchain record at this time. Please try again later.";
    }

    // Record verification telemetry
    await prisma.verificationRecord.create({
      data: {
        certificateId: cert.id,
        verificationType: "CERTIFICATE_ID",
        result: status,
        submittedHash: cert.documentSha256,
        ipHash,
        userAgent,
      },
    });

    const fraudRisk = fraudDetectionService.evaluate({
      certificateFound: true,
      hashMatched: true,
      isRevoked: status === "REVOKED",
      issuerStatus: cert.institution.status,
      issueDate: cert.issueDate,
      certificateId: cert.certificateId,
      hasValidPdfHeader: true,
    });

    // Save fraud analysis
    await prisma.fraudAnalysis.create({
      data: {
        certificateId: cert.id,
        riskScore: fraudRisk.riskScore,
        classification: fraudRisk.classification,
        reasons: JSON.stringify(fraudRisk.reasons),
        engineVersion: fraudRisk.engineVersion,
      },
    });

    socketManager.emitVerificationCompleted(cert.institutionId, cert.certificateId, status);

    return {
      status,
      message,
      certificateId: cert.certificateId,
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        title: cert.title,
        degree: cert.degree,
        department: cert.department,
        issueDate: cert.issueDate,
        institutionName: cert.institution.name,
        institutionCode: cert.institution.code,
        studentName: cert.studentProfile.fullName,
        documentSha256: cert.documentSha256,
        txHash: cert.txHash,
        blockNumber: cert.blockNumber,
        revokedAt: cert.revokedAt,
        revocationReason: cert.revocationReason,
      },
      integrity: {
        hashMatched: true,
        registeredHash: cert.documentSha256,
      },
      blockchain: {
        checked: onChainChecked,
        confirmedOnChain: onChainValid,
        network: cert.blockchainNetwork,
        txHash: cert.txHash,
      },
      fraudRisk,
      verifiedAt,
    };
  }

  /**
   * Public verification by Uploaded Document PDF.
   */
  async verifyByDocumentUpload(
    fileBuffer: Buffer,
    candidateCertificateId?: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<VerificationResponse> {
    const verifiedAt = new Date().toISOString();
    const ipHash = clientIp ? anonymizeIp(clientIp) : null;

    // Validate magic bytes
    const hasValidPdfHeader =
      fileBuffer.length >= 4 &&
      fileBuffer[0] === 0x25 &&
      fileBuffer[1] === 0x50 &&
      fileBuffer[2] === 0x44 &&
      fileBuffer[3] === 0x46;

    // Compute raw-byte SHA-256
    const uploadedHash = calculateSha256(fileBuffer);

    // If candidateCertificateId is supplied, find by ID; otherwise look up by matching hash
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cert: any = null;

    if (candidateCertificateId) {
      cert = await prisma.certificate.findUnique({
        where: { certificateId: candidateCertificateId },
        include: { institution: true, studentProfile: true },
      });
    } else {
      cert = await prisma.certificate.findFirst({
        where: { documentSha256: uploadedHash },
        include: { institution: true, studentProfile: true },
      });
    }

    // Case: NOT FOUND
    if (!cert) {
      await prisma.verificationRecord.create({
        data: {
          verificationType: "DOCUMENT_UPLOAD",
          result: "NOT_FOUND",
          submittedHash: uploadedHash,
          ipHash,
          userAgent,
        },
      });

      const fraudRisk = fraudDetectionService.evaluate({
        certificateFound: false,
        hashMatched: false,
        isRevoked: false,
        hasValidPdfHeader,
        certificateId: candidateCertificateId,
      });

      return {
        status: "NOT_FOUND",
        message: "No matching certificate record was found for this uploaded document.",
        integrity: {
          hashMatched: false,
          submittedHash: uploadedHash,
        },
        blockchain: { checked: false, confirmedOnChain: false, network: "hardhat" },
        fraudRisk,
        verifiedAt,
      };
    }

    // Compare raw byte hashes
    const hashMatched = cert.documentSha256.toLowerCase() === uploadedHash.toLowerCase();

    // Query blockchain
    let onChainChecked = false;
    let onChainValid = false;
    let onChainRevoked = false;
    let onChainTampered = false;
    let onChainError = false;

    try {
      const health = await blockchainService.checkHealth();
      if (!health.connected) {
        onChainError = true;
      } else {
        const onChainRes = await blockchainService.verifyOnChain(cert.onChainKey, uploadedHash);
        onChainChecked = true;
        onChainValid = onChainRes.isValid;
        onChainTampered = onChainRes.isTampered;
        onChainRevoked = onChainRes.isRevoked;
      }
    } catch (err) {
      logger.warn("Blockchain check failed during file upload verification", { error: (err as Error).message });
      onChainError = true;
    }

    // Determine Status
    let status: VerificationStatus = "VERIFIED";
    let message = "The document matches the registered cryptographic hash and is authentic.";

    if (!hashMatched || onChainTampered) {
      status = "TAMPERED";
      message = "The uploaded document has been modified or altered. Its hash does not match the registered cryptographic proof.";
    } else if (cert.status === "REVOKED" || onChainRevoked) {
      status = "REVOKED";
      message = "This certificate was issued previously but has been formally revoked by its issuing authority.";
    } else if (cert.status === "PENDING_BLOCKCHAIN" && !onChainValid) {
      status = "PENDING_BLOCKCHAIN_CONFIRMATION";
      message = "The certificate is pending blockchain block confirmation.";
    } else if (onChainError) {
      status = "BLOCKCHAIN_VERIFICATION_UNAVAILABLE";
      message = "The system could not verify the blockchain record at this time. Please try again later.";
    }

    // Record verification record
    await prisma.verificationRecord.create({
      data: {
        certificateId: cert.id,
        verificationType: "DOCUMENT_UPLOAD",
        result: status,
        submittedHash: uploadedHash,
        ipHash,
        userAgent,
      },
    });

    const fraudRisk = fraudDetectionService.evaluate({
      certificateFound: true,
      hashMatched,
      isRevoked: status === "REVOKED",
      issuerStatus: cert.institution.status,
      issueDate: cert.issueDate,
      certificateId: cert.certificateId,
      hasValidPdfHeader,
    });

    await prisma.fraudAnalysis.create({
      data: {
        certificateId: cert.id,
        riskScore: fraudRisk.riskScore,
        classification: fraudRisk.classification,
        reasons: JSON.stringify(fraudRisk.reasons),
        engineVersion: fraudRisk.engineVersion,
      },
    });

    socketManager.emitVerificationCompleted(cert.institutionId, cert.certificateId, status);

    return {
      status,
      message,
      certificateId: cert.certificateId,
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        title: cert.title,
        degree: cert.degree,
        department: cert.department,
        issueDate: cert.issueDate,
        institutionName: cert.institution.name,
        institutionCode: cert.institution.code,
        studentName: cert.studentProfile.fullName,
        documentSha256: cert.documentSha256,
        txHash: cert.txHash,
        blockNumber: cert.blockNumber,
        revokedAt: cert.revokedAt,
        revocationReason: cert.revocationReason,
      },
      integrity: {
        hashMatched,
        registeredHash: cert.documentSha256,
        submittedHash: uploadedHash,
      },
      blockchain: {
        checked: onChainChecked,
        confirmedOnChain: onChainValid,
        network: cert.blockchainNetwork,
        txHash: cert.txHash,
      },
      fraudRisk,
      verifiedAt,
    };
  }

  /**
   * Anonymized verification history for a certificate.
   */
  async getVerificationHistory(certificateId: string) {
    const cert = await prisma.certificate.findUnique({ where: { certificateId } });
    if (!cert) {
      throw new Error("CERTIFICATE_NOT_FOUND: Certificate not found");
    }

    const history = await prisma.verificationRecord.findMany({
      where: { certificateId: cert.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        verificationType: true,
        result: true,
        createdAt: true,
      },
    });

    return history;
  }
}

export const verificationService = new VerificationService();
