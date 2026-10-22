import { Router } from "express";
import { verificationController } from "../controllers/verification.controller";
import { uploadSinglePdf, validatePdfMagicBytes } from "../middleware/upload";
import { verificationRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public verification by Certificate ID
router.get("/:certificateId", verificationRateLimiter, verificationController.verifyById);

// Public verification by uploaded Document PDF
router.post(
  "/upload",
  verificationRateLimiter,
  uploadSinglePdf,
  validatePdfMagicBytes,
  verificationController.verifyUpload
);

// Public verification history (anonymized)
router.get("/:certificateId/history", verificationController.getHistory);

export default router;
