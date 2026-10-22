import QRCode from "qrcode";
import { prisma } from "../../utils/db";
import { logger } from "../../utils/logger";
import { calculateSha256, deriveOnChainKey, generateCertificateId } from "../../utils/crypto";
import { storageService } from "../storage/storage.service";
import { blockchainService } from "../blockchain/blockchain.service";
import { socketManager } from "../../sockets/socket.manager";
import { auditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../../middleware/auth";
import { config } from "../../config";

export interface IssueCertificateParams {
  issuerUser: AuthenticatedUser;
  studentName: string;
  studentIdentifier: string;
  studentEmail: string;
  title: string;
  degree: string;
  department?: string;
  cgpaOrGrade?: string;
  issueDate: string;
  expiryDate?: string;
  pdfBuffer: Buffer;
}

export class CertificateService {
  /**
   * Complete issuance pipeline:
   * Upload -> SHA-256 -> Storage -> PostgreSQL -> Blockchain Tx -> Socket.IO -> QR Code
   */
  async issueCertificate(params: IssueCertificateParams) {
    if (!params.issuerUser.institutionId) {
      throw new Error("INSTITUTION_REQUIRED: Issuer must belong to an approved institution");
    }

    const institution = await prisma.institution.findUnique({
      where: { id: params.issuerUser.institutionId },
    });
    if (!institution || institution.status !== "ACTIVE") {
      throw new Error("INVALID_INSTITUTION: Issuing institution is not active or verified");
    }

    // 1. Find or create StudentProfile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: {
        institutionId_studentIdentifier: {
          institutionId: institution.id,
          studentIdentifier: params.studentIdentifier,
        },
      },
    });

    if (!studentProfile) {
      // Find if student has a registered user account
      const studentUser = await prisma.user.findUnique({
        where: { email: params.studentEmail.toLowerCase() },
      });

      studentProfile = await prisma.studentProfile.create({
        data: {
          institutionId: institution.id,
          userId: studentUser ? studentUser.id : null,
          studentIdentifier: params.studentIdentifier,
          fullName: params.studentName,
          email: params.studentEmail.toLowerCase(),
        },
      });
    }

    // 2. Compute Raw Byte SHA-256 directly from file buffer
    const documentSha256 = calculateSha256(params.pdfBuffer);

    // 3. Generate unique, non-enumerable Certificate ID & onChainKey
    let certificateId = generateCertificateId();
    // Ensure uniqueness
    while (await prisma.certificate.findUnique({ where: { certificateId } })) {
      certificateId = generateCertificateId();
    }
    const onChainKey = deriveOnChainKey(certificateId);

    // 4. Save file to protected storage adapter
    const documentStorageKey = await storageService.saveCertificatePdf(
      certificateId,
      params.pdfBuffer
    );

    // 5. Persist Certificate record with initial PENDING_BLOCKCHAIN status
    const certificate = await prisma.certificate.create({
      data: {
        certificateId,
        studentProfileId: studentProfile.id,
        institutionId: institution.id,
        title: params.title,
        degree: params.degree,
        department: params.department || null,
        cgpaOrGrade: params.cgpaOrGrade || null,
        issueDate: new Date(params.issueDate),
        expiryDate: params.expiryDate ? new Date(params.expiryDate) : null,
        documentStorageKey,
        documentSha256,
        onChainKey,
        status: "PENDING_BLOCKCHAIN",
        blockchainNetwork: config.BLOCKCHAIN_NETWORK,
      },
      include: {
        institution: true,
        studentProfile: true,
      },
    });

    // 6. Record BlockchainTransaction
    const txRecord = await prisma.blockchainTransaction.create({
      data: {
        certificateId: certificate.id,
        action: "REGISTER",
        network: config.BLOCKCHAIN_NETWORK,
        status: "QUEUED",
      },
    });

    // 7. Emit Real-Time status update
    socketManager.emitCertificateStatus(institution.id, certificateId, "PENDING_BLOCKCHAIN");

    // 8. Generate QR Code containing public verification URL
    const verificationUrl = `${config.FRONTEND_URL}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    // 9. Process blockchain registration in background (non-blocking for HTTP response)
    this.processBlockchainRegistration(
      certificate.id,
      certificateId,
      institution.id,
      onChainKey,
      documentSha256,
      txRecord.id
    );

    await auditService.log({
      userId: params.issuerUser.id,
      action: "CERTIFICATE_ISSUED",
      entityType: "Certificate",
      entityId: certificate.id,
      metadata: {
        certificateId,
        studentIdentifier: params.studentIdentifier,
        sha256: documentSha256,
      },
    });

    return {
      certificate,
      qrCodeDataUrl,
      verificationUrl,
    };
  }

  /**
   * Asynchronous blockchain registration worker.
   */
  private async processBlockchainRegistration(
    certDbId: string,
    certificateId: string,
    institutionId: string,
    onChainKey: string,
    documentSha256: string,
    txDbId: string
  ) {
    try {
      // Check blockchain health first
      const health = await blockchainService.checkHealth();
      if (!health.connected) {
        logger.warn("Blockchain node not reachable for certificate registration", { certificateId });
        await prisma.blockchainTransaction.update({
          where: { id: txDbId },
          data: {
            status: "FAILED",
            errorMessage: "Blockchain RPC node unavailable",
          },
        });
        socketManager.emitBlockchainFailed(institutionId, certificateId, "Blockchain RPC unavailable");
        return;
      }

      // Submit registration transaction
      const { txHash, blockNumber } = await blockchainService.registerCertificate(
        onChainKey,
        documentSha256
      );

      // Update tx record
      await prisma.blockchainTransaction.update({
        where: { id: txDbId },
        data: {
          txHash,
          blockNumber,
          status: "CONFIRMED",
          submittedAt: new Date(),
          confirmedAt: new Date(),
        },
      });

      // Update Certificate status to ACTIVE
      await prisma.certificate.update({
        where: { id: certDbId },
        data: {
          status: "ACTIVE",
          txHash,
          blockNumber,
        },
      });

      // Emit real-time confirmation events
      socketManager.emitBlockchainSubmitted(institutionId, certificateId, txHash);
      socketManager.emitBlockchainConfirmed(institutionId, certificateId, blockNumber, txHash);
      socketManager.emitCertificateStatus(institutionId, certificateId, "ACTIVE", txHash);
      socketManager.emitDashboardStatsUpdated(institutionId);

      logger.info(`Certificate ${certificateId} confirmed on blockchain in block ${blockNumber}`);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Unknown blockchain error";
      logger.error("Blockchain registration worker error", { certificateId, error: errMessage });

      await prisma.blockchainTransaction.update({
        where: { id: txDbId },
        data: {
          status: "FAILED",
          errorMessage: errMessage,
        },
      });

      socketManager.emitBlockchainFailed(institutionId, certificateId, errMessage);
    }
  }

  /**
   * Revoke an issued certificate.
   */
  async revokeCertificate(certificateId: string, reason: string, user: AuthenticatedUser) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: { institution: true },
    });

    if (!cert) {
      throw new Error("CERTIFICATE_NOT_FOUND: Certificate not found");
    }

    if (user.role !== "SUPER_ADMIN" && user.institutionId !== cert.institutionId) {
      throw new Error("FORBIDDEN: You are not authorized to revoke certificates for this institution");
    }

    if (cert.status === "REVOKED") {
      throw new Error("ALREADY_REVOKED: Certificate has already been revoked");
    }

    const now = new Date();

    // Update in database first
    const updatedCert = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "REVOKED",
        revokedAt: now,
        revocationReason: reason,
      },
      include: { institution: true, studentProfile: true },
    });

    // Create tx record
    const txRecord = await prisma.blockchainTransaction.create({
      data: {
        certificateId: cert.id,
        action: "REVOKE",
        network: config.BLOCKCHAIN_NETWORK,
        status: "QUEUED",
      },
    });

    // Submit on-chain revocation asynchronously
    (async () => {
      try {
        const health = await blockchainService.checkHealth();
        if (health.connected) {
          const { txHash, blockNumber } = await blockchainService.revokeCertificate(
            cert.onChainKey,
            reason
          );

          await prisma.blockchainTransaction.update({
            where: { id: txRecord.id },
            data: {
              txHash,
              blockNumber,
              status: "CONFIRMED",
              submittedAt: new Date(),
              confirmedAt: new Date(),
            },
          });
          logger.info(`Revocation transaction confirmed on-chain for ${certificateId}`, { txHash });
        }
      } catch (err) {
        logger.error("On-chain revocation failed", { error: (err as Error).message });
        await prisma.blockchainTransaction.update({
          where: { id: txRecord.id },
          data: { status: "FAILED", errorMessage: (err as Error).message },
        });
      }
    })();

    // Emit real-time notification
    socketManager.emitCertificateRevoked(cert.institutionId, certificateId, reason);
    socketManager.emitCertificateStatus(cert.institutionId, certificateId, "REVOKED");
    socketManager.emitDashboardStatsUpdated(cert.institutionId);

    await auditService.log({
      userId: user.id,
      action: "CERTIFICATE_REVOKED",
      entityType: "Certificate",
      entityId: cert.id,
      metadata: { certificateId, reason },
    });

    return updatedCert;
  }

  /**
   * Retrieve single certificate details.
   */
  async getCertificateById(certificateId: string, user?: AuthenticatedUser) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        institution: true,
        studentProfile: true,
        transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!cert) {
      throw new Error("CERTIFICATE_NOT_FOUND: Certificate record not found");
    }

    // Role-based visibility check if accessed through dashboard
    if (user && user.role === "STUDENT") {
      if (cert.studentProfile.email !== user.email && cert.studentProfile.userId !== user.id) {
        throw new Error("FORBIDDEN: You do not have permission to view this certificate");
      }
    } else if (user && user.role === "INSTITUTION_ISSUER") {
      if (user.institutionId !== cert.institutionId) {
        throw new Error("FORBIDDEN: You do not have permission to view another institution's certificate");
      }
    }

    const verificationUrl = `${config.FRONTEND_URL}/verify/${cert.certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 300, margin: 2 });

    return {
      ...cert,
      qrCodeDataUrl,
      verificationUrl,
    };
  }

  /**
   * List certificates filtered by role scope.
   */
  async listCertificates(user: AuthenticatedUser, query?: { search?: string; status?: string; page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (user.role === "INSTITUTION_ISSUER") {
      where.institutionId = user.institutionId;
    } else if (user.role === "STUDENT") {
      where.studentProfile = { email: user.email };
    }
    // SUPER_ADMIN sees all

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { certificateId: { contains: query.search } },
        { title: { contains: query.search } },
        { studentProfile: { fullName: { contains: query.search } } },
        { studentProfile: { studentIdentifier: { contains: query.search } } },
      ];
    }

    const [total, certificates] = await Promise.all([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({
        where,
        include: {
          institution: { select: { name: true, code: true } },
          studentProfile: { select: { fullName: true, studentIdentifier: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      certificates,
    };
  }

  /**
   * Authorized download of original certificate PDF.
   */
  async downloadCertificatePdf(certificateId: string, user: AuthenticatedUser): Promise<Buffer> {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: { studentProfile: true },
    });

    if (!cert) {
      throw new Error("CERTIFICATE_NOT_FOUND: Certificate not found");
    }

    // Role-based authorization
    if (user.role === "STUDENT") {
      if (cert.studentProfile.email !== user.email && cert.studentProfile.userId !== user.id) {
        throw new Error("FORBIDDEN: You are not authorized to download this certificate");
      }
    } else if (user.role === "INSTITUTION_ISSUER") {
      if (user.institutionId !== cert.institutionId) {
        throw new Error("FORBIDDEN: You cannot download documents from another institution");
      }
    }

    return storageService.getCertificatePdf(cert.documentStorageKey);
  }
}

export const certificateService = new CertificateService();
