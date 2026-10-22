import { Request, Response, NextFunction } from "express";
import { blockchainService } from "../services/blockchain/blockchain.service";
import { prisma } from "../utils/db";

export class BlockchainController {
  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await blockchainService.checkHealth();
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const skip = (page - 1) * limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (req.user?.role === "INSTITUTION_ISSUER") {
        where.certificate = { institutionId: req.user.institutionId };
      }

      const [total, transactions] = await Promise.all([
        prisma.blockchainTransaction.count({ where }),
        prisma.blockchainTransaction.findMany({
          where,
          include: {
            certificate: {
              select: {
                certificateId: true,
                title: true,
                institution: { select: { name: true, code: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          total,
          page,
          limit,
          transactions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOnChainCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificateId = String(req.params.certificateId);
      const cert = await prisma.certificate.findUnique({
        where: { certificateId },
        select: { onChainKey: true, certificateId: true },
      });

      if (!cert) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
        return;
      }

      const onChainRecord = await blockchainService.getCertificate(cert.onChainKey);

      res.status(200).json({
        success: true,
        data: {
          certificateId: cert.certificateId,
          onChainRecord,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const blockchainController = new BlockchainController();
