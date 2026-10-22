import { Request, Response, NextFunction } from "express";
import { certificateService } from "../services/certificates/certificate.service";
import { issueCertificateSchema, revokeCertificateSchema } from "../validators/certificate.validator";

export class CertificateController {
  async issue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: { code: "MISSING_FILE", message: "Certificate PDF document is required" } });
        return;
      }

      const validated = issueCertificateSchema.parse(req.body);

      const result = await certificateService.issueCertificate({
        issuerUser: req.user,
        studentName: validated.studentName,
        studentIdentifier: validated.studentIdentifier,
        studentEmail: validated.studentEmail,
        title: validated.title,
        degree: validated.degree,
        department: validated.department,
        cgpaOrGrade: validated.cgpaOrGrade,
        issueDate: validated.issueDate,
        expiryDate: validated.expiryDate,
        pdfBuffer: req.file.buffer,
      });

      res.status(201).json({
        success: true,
        message: "Certificate registered and submitted for blockchain block confirmation",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }

      const { search, status, page, limit } = req.query;
      const result = await certificateService.listCertificates(req.user, {
        search: typeof search === "string" ? search : undefined,
        status: typeof status === "string" ? status : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const certificate = await certificateService.getCertificateById(id, req.user);
      res.status(200).json({
        success: true,
        data: { certificate },
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("CERTIFICATE_NOT_FOUND")) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
        return;
      }
      if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: error.message } });
        return;
      }
      next(error);
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }

      const id = String(req.params.id);
      const validated = revokeCertificateSchema.parse(req.body);

      const updated = await certificateService.revokeCertificate(id, validated.reason, req.user);

      res.status(200).json({
        success: true,
        message: "Certificate has been revoked and marked on-chain",
        data: { certificate: updated },
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("CERTIFICATE_NOT_FOUND")) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
        return;
      }
      if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: error.message } });
        return;
      }
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }

      const id = String(req.params.id);
      const pdfBuffer = await certificateService.downloadCertificatePdf(id, req.user);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: error.message } });
        return;
      }
      if (error instanceof Error && error.message.startsWith("CERTIFICATE_NOT_FOUND")) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
        return;
      }
      next(error);
    }
  }
}

export const certificateController = new CertificateController();
