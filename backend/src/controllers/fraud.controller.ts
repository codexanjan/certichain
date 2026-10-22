import { Request, Response, NextFunction } from "express";
import { fraudDetectionService } from "../services/fraud/fraud.service";
import { prisma } from "../utils/db";

export class FraudController {
  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { certificateId, candidateHash, issueDate } = req.body;

      let certificateFound = false;
      let hashMatched = false;
      let isRevoked = false;
      let issuerStatus = "UNKNOWN";

      if (certificateId) {
        const cert = await prisma.certificate.findUnique({
          where: { certificateId },
          include: { institution: true },
        });

        if (cert) {
          certificateFound = true;
          isRevoked = cert.status === "REVOKED";
          issuerStatus = cert.institution.status;
          if (candidateHash) {
            hashMatched = cert.documentSha256.toLowerCase() === candidateHash.toLowerCase();
          }
        }
      }

      const result = fraudDetectionService.evaluate({
        certificateFound,
        hashMatched,
        isRevoked,
        issuerStatus,
        issueDate,
        certificateId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateFraudAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificateId = String(req.params.certificateId);
      const cert = await prisma.certificate.findUnique({ where: { certificateId } });

      if (!cert) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
        return;
      }

      const analyses = await prisma.fraudAnalysis.findMany({
        where: { certificateId: cert.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      res.status(200).json({
        success: true,
        data: { analyses },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fraudController = new FraudController();
