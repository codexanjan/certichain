import { Request, Response, NextFunction } from "express";
import { verificationService } from "../services/verification/verification.service";

export class VerificationController {
  async verifyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificateId = String(req.params.certificateId);
      const clientIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await verificationService.verifyByCertificateId(
        certificateId,
        clientIp,
        userAgent
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: "MISSING_FILE", message: "PDF document is required for verification" },
        });
        return;
      }

      const candidateCertificateId = req.body?.certificateId;
      const clientIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await verificationService.verifyByDocumentUpload(
        req.file.buffer,
        candidateCertificateId,
        clientIp,
        userAgent
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const certificateId = String(req.params.certificateId);
      const history = await verificationService.getVerificationHistory(certificateId);
      res.status(200).json({
        success: true,
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
