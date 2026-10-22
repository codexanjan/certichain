import { Router } from "express";
import { certificateController } from "../controllers/certificate.controller";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { uploadSinglePdf, validatePdfMagicBytes } from "../middleware/upload";

const router = Router();

// Issuance - Issuer only
router.post(
  "/",
  authenticateToken,
  requireRole("INSTITUTION_ISSUER"),
  uploadSinglePdf,
  validatePdfMagicBytes,
  certificateController.issue
);

// List certificates (scoped by role inside controller)
router.get("/", authenticateToken, certificateController.list);

// View single certificate
router.get("/:id", authenticateToken, certificateController.getById);

// Revocation - Issuer or Super Admin
router.post(
  "/:id/revoke",
  authenticateToken,
  requireRole("INSTITUTION_ISSUER", "SUPER_ADMIN"),
  certificateController.revoke
);

// Download certificate PDF (protected access)
router.get("/:id/download", authenticateToken, certificateController.download);

export default router;
