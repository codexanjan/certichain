import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authenticateToken, analyticsController.getDashboardAnalytics);

export default router;
