import { Router } from "express";
import { fraudController } from "../controllers/fraud.controller";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

router.post("/analyze", authenticateToken, fraudController.analyze);
router.get("/:certificateId", authenticateToken, requireRole("INSTITUTION_ISSUER", "SUPER_ADMIN"), fraudController.getCertificateFraudAnalysis);

export default router;
