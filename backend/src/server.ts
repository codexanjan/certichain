import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { prisma } from "./utils/db";
import { blockchainService } from "./services/blockchain/blockchain.service";

async function startServer() {
  const { server } = createApp();

  // Test Database Connection
  try {
    await prisma.$connect();
    logger.info("Database connection established successfully");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }

  // Check Blockchain RPC Status
  const blockchainHealth = await blockchainService.checkHealth();
  if (blockchainHealth.connected) {
    logger.info(`Blockchain RPC connected: ${blockchainHealth.network} at block #${blockchainHealth.blockNumber}`);
  } else {
    logger.warn(`Blockchain RPC not reachable at ${config.BLOCKCHAIN_RPC_URL}. Running in degraded blockchain mode.`);
  }

  // Start HTTP & WebSocket Server
  server.listen(config.PORT, () => {
    logger.info("==================================================");
    logger.info(`CertiChain Backend running on port ${config.PORT}`);
    logger.info(`API Base URL: http://localhost:${config.PORT}/api/v1`);
    logger.info(`Environment:  ${config.NODE_ENV}`);
    logger.info("==================================================");
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Server closed. Process terminated.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});
