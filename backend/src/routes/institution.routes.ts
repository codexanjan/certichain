import { Router } from "express";
import { institutionController } from "../controllers/institution.controller";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

// Public institutional directory
router.get("/", institutionController.listInstitutions);
router.get("/:id", institutionController.getInstitutionById);

// Admin-only endpoints
router.get("/admin/applications", authenticateToken, requireRole("SUPER_ADMIN"), institutionController.listApplications);
router.post("/admin/applications/:id/approve", authenticateToken, requireRole("SUPER_ADMIN"), institutionController.approveApplication);
router.post("/admin/applications/:id/reject", authenticateToken, requireRole("SUPER_ADMIN"), institutionController.rejectApplication);
router.get("/admin/users", authenticateToken, requireRole("SUPER_ADMIN"), institutionController.listUsers);
router.patch("/admin/users/:id/status", authenticateToken, requireRole("SUPER_ADMIN"), institutionController.updateUserStatus);

// Student management for issuers
router.get("/issuer/students", authenticateToken, requireRole("INSTITUTION_ISSUER", "SUPER_ADMIN"), institutionController.listStudents);
router.post("/issuer/students", authenticateToken, requireRole("INSTITUTION_ISSUER"), institutionController.createStudent);

export default router;
