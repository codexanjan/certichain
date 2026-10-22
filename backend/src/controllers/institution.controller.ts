import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db";
import { auditService } from "../services/audit/audit.service";
import { socketManager } from "../sockets/socket.manager";

export class InstitutionController {
  async listInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutions = await prisma.institution.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          contactEmail: true,
          walletAddress: true,
          status: true,
          createdAt: true,
          _count: {
            select: { certificates: true, students: true },
          },
        },
        orderBy: { name: "asc" },
      });
      res.status(200).json({ success: true, data: { institutions } });
    } catch (error) {
      next(error);
    }
  }

  async getInstitutionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          _count: { select: { certificates: true, students: true } },
        },
      });
      if (!institution) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Institution not found" } });
        return;
      }
      res.status(200).json({ success: true, data: { institution } });
    } catch (error) {
      next(error);
    }
  }

  async listApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await prisma.institutionApplication.findMany({
        include: { applicantUser: { select: { email: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({ success: true, data: { applications } });
    } catch (error) {
      next(error);
    }
  }

  async approveApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const application = await prisma.institutionApplication.findUnique({
        where: { id },
        include: { applicantUser: true },
      });

      if (!application) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Application not found" } });
        return;
      }

      if (application.status !== "PENDING") {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: `Application is already ${application.status}` } });
        return;
      }

      // Create or link Institution
      let institution = await prisma.institution.findUnique({
        where: { code: application.institutionCode },
      });

      if (!institution) {
        institution = await prisma.institution.create({
          data: {
            name: application.institutionName,
            code: application.institutionCode,
            contactEmail: application.officialEmail,
            status: "ACTIVE",
          },
        });
      }

      // Update User to ACTIVE and link institution
      await prisma.user.update({
        where: { id: application.applicantUserId },
        data: {
          role: "INSTITUTION_ISSUER",
          status: "ACTIVE",
          institutionId: institution.id,
        },
      });

      // Update Application
      const updatedApp = await prisma.institutionApplication.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedByUserId: req.user?.id,
          reviewNotes: req.body?.notes || "Approved by Super Admin",
        },
      });

      await auditService.log({
        userId: req.user?.id,
        action: "ISSUER_APPLICATION_APPROVED",
        entityType: "InstitutionApplication",
        entityId: application.id,
        metadata: { institutionId: institution.id, institutionName: institution.name },
      });

      socketManager.emitDashboardStatsUpdated();

      res.status(200).json({
        success: true,
        message: "Institution application approved successfully",
        data: { application: updatedApp, institution },
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const application = await prisma.institutionApplication.findUnique({ where: { id } });

      if (!application) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Application not found" } });
        return;
      }

      const updated = await prisma.institutionApplication.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedByUserId: req.user?.id,
          reviewNotes: req.body?.notes || "Application does not meet institutional requirements",
        },
      });

      await prisma.user.update({
        where: { id: application.applicantUserId },
        data: { status: "REJECTED" },
      });

      await auditService.log({
        userId: req.user?.id,
        action: "ISSUER_APPLICATION_REJECTED",
        entityType: "InstitutionApplication",
        entityId: application.id,
      });

      res.status(200).json({
        success: true,
        message: "Institution application rejected",
        data: { application: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          institution: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status } = req.body;

      if (!["ACTIVE", "SUSPENDED"].includes(status)) {
        res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Status must be ACTIVE or SUSPENDED" } });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: { id: true, email: true, status: true },
      });

      await auditService.log({
        userId: req.user?.id,
        action: `USER_STATUS_${status}`,
        entityType: "User",
        entityId: user.id,
      });

      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (req.user?.role === "INSTITUTION_ISSUER") {
        where.institutionId = req.user.institutionId;
      }

      const students = await prisma.studentProfile.findMany({
        where,
        include: {
          institution: { select: { name: true, code: true } },
          _count: { select: { certificates: true } },
        },
        orderBy: { fullName: "asc" },
      });

      res.status(200).json({ success: true, data: { students } });
    } catch (error) {
      next(error);
    }
  }

  async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Issuer must have an institution" } });
        return;
      }

      const { fullName, studentIdentifier, email } = req.body;
      if (!fullName || !studentIdentifier || !email) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "fullName, studentIdentifier, and email are required" } });
        return;
      }

      const existing = await prisma.studentProfile.findUnique({
        where: {
          institutionId_studentIdentifier: {
            institutionId,
            studentIdentifier,
          },
        },
      });

      if (existing) {
        res.status(400).json({ success: false, error: { code: "DUPLICATE", message: "Student with this identifier already exists in this institution" } });
        return;
      }

      const student = await prisma.studentProfile.create({
        data: {
          institutionId,
          fullName,
          studentIdentifier,
          email: email.toLowerCase(),
        },
      });

      res.status(201).json({ success: true, data: { student } });
    } catch (error) {
      next(error);
    }
  }
}

export const institutionController = new InstitutionController();
