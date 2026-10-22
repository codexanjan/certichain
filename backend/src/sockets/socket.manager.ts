import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface SocketUser {
  userId: string;
  role: string;
  institutionId?: string | null;
}

export class SocketManager {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HttpServer): void {
    const allowedOrigins = config.CORS_ORIGINS.split(",").map((s) => s.trim());

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // Authentication middleware for socket connections
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        // Allow unauthenticated connection for public verification pages (they can join public cert rooms)
        socket.data.user = null;
        return next();
      }

      try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as {
          sub: string;
          role: string;
          institutionId?: string | null;
        };

        socket.data.user = {
          userId: decoded.sub,
          role: decoded.role,
          institutionId: decoded.institutionId,
        };
        next();
      } catch (err) {
        logger.warn("Socket handshake JWT validation failed", { error: (err as Error).message });
        socket.data.user = null;
        next();
      }
    });

    this.io.on("connection", (socket: Socket) => {
      const user = socket.data.user as SocketUser | null;
      logger.info(`Socket connected: ${socket.id}`, { user: user?.userId || "public" });

      if (user) {
        // Automatically join user personal room
        socket.join(`user_${user.userId}`);

        // If issuer, join institution room
        if (user.institutionId) {
          socket.join(`institution_${user.institutionId}`);
        }

        // If admin, join admin room
        if (user.role === "SUPER_ADMIN") {
          socket.join("admin_room");
        }
      }

      // Allow joining certificate specific room for live verification watching
      socket.on("join:certificate", (certificateId: string) => {
        if (certificateId && typeof certificateId === "string") {
          socket.join(`cert_${certificateId}`);
          logger.info(`Socket ${socket.id} joined cert room: cert_${certificateId}`);
        }
      });

      socket.on("leave:certificate", (certificateId: string) => {
        if (certificateId && typeof certificateId === "string") {
          socket.leave(`cert_${certificateId}`);
        }
      });

      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    logger.info("Socket.IO initialized successfully");
  }

  // --- Broadcast Methods ---

  emitCertificateStatus(
    institutionId: string,
    certificateId: string,
    status: string,
    txHash?: string | null
  ): void {
    if (!this.io) return;
    const payload = { certificateId, status, txHash, timestamp: new Date().toISOString() };
    this.io.to(`institution_${institutionId}`).emit("certificate:status", payload);
    this.io.to(`cert_${certificateId}`).emit("certificate:status", payload);
    this.io.to("admin_room").emit("certificate:status", payload);
  }

  emitBlockchainSubmitted(
    institutionId: string,
    certificateId: string,
    txHash: string
  ): void {
    if (!this.io) return;
    const payload = { certificateId, txHash, network: config.BLOCKCHAIN_NETWORK };
    this.io.to(`institution_${institutionId}`).emit("blockchain:submitted", payload);
    this.io.to(`cert_${certificateId}`).emit("blockchain:submitted", payload);
    this.io.to("admin_room").emit("blockchain:submitted", payload);
  }

  emitBlockchainConfirmed(
    institutionId: string,
    certificateId: string,
    blockNumber: number,
    txHash: string
  ): void {
    if (!this.io) return;
    const payload = { certificateId, blockNumber, txHash, timestamp: new Date().toISOString() };
    this.io.to(`institution_${institutionId}`).emit("blockchain:confirmed", payload);
    this.io.to(`cert_${certificateId}`).emit("blockchain:confirmed", payload);
    this.io.to("admin_room").emit("blockchain:confirmed", payload);
  }

  emitBlockchainFailed(
    institutionId: string,
    certificateId: string,
    error: string
  ): void {
    if (!this.io) return;
    const payload = { certificateId, error, timestamp: new Date().toISOString() };
    this.io.to(`institution_${institutionId}`).emit("blockchain:failed", payload);
    this.io.to(`cert_${certificateId}`).emit("blockchain:failed", payload);
    this.io.to("admin_room").emit("blockchain:failed", payload);
  }

  emitCertificateRevoked(
    institutionId: string,
    certificateId: string,
    reason: string
  ): void {
    if (!this.io) return;
    const payload = { certificateId, reason, timestamp: new Date().toISOString() };
    this.io.to(`institution_${institutionId}`).emit("certificate:revoked", payload);
    this.io.to(`cert_${certificateId}`).emit("certificate:revoked", payload);
    this.io.to("admin_room").emit("certificate:revoked", payload);
  }

  emitVerificationCompleted(
    institutionId: string | null,
    certificateId: string,
    result: string
  ): void {
    if (!this.io) return;
    const payload = { certificateId, result, timestamp: new Date().toISOString() };
    if (institutionId) {
      this.io.to(`institution_${institutionId}`).emit("verification:completed", payload);
    }
    this.io.to("admin_room").emit("verification:completed", payload);
  }

  emitDashboardStatsUpdated(institutionId?: string | null): void {
    if (!this.io) return;
    if (institutionId) {
      this.io.to(`institution_${institutionId}`).emit("dashboard:stats-updated", { institutionId });
    }
    this.io.to("admin_room").emit("dashboard:stats-updated", {});
  }
}

export const socketManager = new SocketManager();
