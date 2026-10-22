import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, authController.register);
router.post("/issuer-application", authRateLimiter, authController.submitIssuerApplication);
router.post("/login", authRateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticateToken, authController.getMe);

export default router;
