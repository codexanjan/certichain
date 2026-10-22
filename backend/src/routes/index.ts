import { Router } from "express";
import authRoutes from "./auth.routes";
import institutionRoutes from "./institution.routes";
import certificateRoutes from "./certificate.routes";
import verificationRoutes from "./verification.routes";
import blockchainRoutes from "./blockchain.routes";
import fraudRoutes from "./fraud.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CertiChain Backend API is operational",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/institutions", institutionRoutes);
router.use("/certificates", certificateRoutes);
router.use("/verify", verificationRoutes);
router.use("/blockchain", blockchainRoutes);
router.use("/fraud", fraudRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
