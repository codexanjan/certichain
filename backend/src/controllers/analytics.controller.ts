import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db";

export class AnalyticsController {
  async getDashboardAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certWhere: any = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const verifWhere: any = {};

      if (user.role === "INSTITUTION_ISSUER") {
        certWhere.institutionId = user.institutionId;
        verifWhere.certificate = { institutionId: user.institutionId };
      } else if (user.role === "STUDENT") {
        certWhere.studentProfile = { email: user.email };
        verifWhere.certificate = { studentProfile: { email: user.email } };
      }

      const [
        totalCertificates,
        confirmedCertificates,
        pendingCertificates,
        revokedCertificates,
        totalVerifications,
        verifiedCount,
        tamperedCount,
        revokedVerificationCount,
        notFoundCount,
        totalInstitutions,
        pendingApplications,
        recentVerifications,
        recentCertificates,
      ] = await Promise.all([
        prisma.certificate.count({ where: certWhere }),
        prisma.certificate.count({ where: { ...certWhere, status: "ACTIVE" } }),
        prisma.certificate.count({ where: { ...certWhere, status: "PENDING_BLOCKCHAIN" } }),
        prisma.certificate.count({ where: { ...certWhere, status: "REVOKED" } }),
        prisma.verificationRecord.count({ where: verifWhere }),
        prisma.verificationRecord.count({ where: { ...verifWhere, result: "VERIFIED" } }),
        prisma.verificationRecord.count({ where: { ...verifWhere, result: "TAMPERED" } }),
        prisma.verificationRecord.count({ where: { ...verifWhere, result: "REVOKED" } }),
        prisma.verificationRecord.count({ where: { ...verifWhere, result: "NOT_FOUND" } }),
        prisma.institution.count(),
        prisma.institutionApplication.count({ where: { status: "PENDING" } }),
        prisma.verificationRecord.findMany({
          where: verifWhere,
          include: {
            certificate: {
              select: {
                certificateId: true,
                title: true,
                institution: { select: { name: true, code: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.certificate.findMany({
          where: certWhere,
          include: {
            institution: { select: { name: true, code: true } },
            studentProfile: { select: { fullName: true, studentIdentifier: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalCertificates,
            confirmedCertificates,
            pendingCertificates,
            revokedCertificates,
            totalVerifications,
            totalInstitutions,
            pendingApplications,
          },
          verificationOutcomes: [
            { name: "Verified", count: verifiedCount, color: "#10B981" },
            { name: "Tampered", count: tamperedCount, color: "#EF4444" },
            { name: "Revoked", count: revokedVerificationCount, color: "#F59E0B" },
            { name: "Not Found", count: notFoundCount, color: "#64748B" },
          ],
          recentVerifications,
          recentCertificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
