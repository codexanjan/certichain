import { Router } from "express";
import { blockchainController } from "../controllers/blockchain.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public blockchain health status
router.get("/health", blockchainController.getHealth);

// Transactions feed (authenticated)
router.get("/transactions", authenticateToken, blockchainController.listTransactions);

// Public on-chain certificate raw lookup
router.get("/certificates/:certificateId", blockchainController.getOnChainCertificate);

export default router;
