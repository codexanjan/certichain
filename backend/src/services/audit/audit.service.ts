import { prisma } from "../../utils/db";
import { logger } from "../../utils/logger";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
      logger.info(`[Audit] ${params.action} on ${params.entityType}:${params.entityId}`);
    } catch (error) {
      logger.error("Failed to write audit log entry", {
        params,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export const auditService = new AuditService();
