import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { config } from "../../config";
import { prisma } from "../../utils/db";
import { auditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../../middleware/auth";

export interface RegisterStudentInput {
  fullName: string;
  email: string;
  password: string;
}

export interface IssuerApplicationInput {
  fullName: string;
  email: string;
  password: string;
  institutionName: string;
  institutionCode: string;
  officialEmail: string;
  websiteUrl: string;
}

export class AuthService {
  /**
   * Generates Access Token (15 min) and Refresh Token (7 days).
   */
  generateTokens(user: { id: string; email: string; role: string; institutionId?: string | null }) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || null,
      },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return { accessToken, rawRefreshToken, tokenHash, expiresAt };
  }

  async registerStudent(input: RegisterStudentInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw new Error("EMAIL_EXISTS: An account with this email address already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    const { accessToken, rawRefreshToken, tokenHash, expiresAt } = this.generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await auditService.log({
      userId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      metadata: { role: "STUDENT" },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async submitIssuerApplication(input: IssuerApplicationInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existingUser) {
      throw new Error("EMAIL_EXISTS: An account with this email address already exists");
    }

    const existingCode = await prisma.institution.findUnique({
      where: { code: input.institutionCode.toUpperCase() },
    });
    if (existingCode) {
      throw new Error("CODE_EXISTS: An institution with this code already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Create user in PENDING status
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        role: "INSTITUTION_ISSUER",
        status: "PENDING",
      },
    });

    const application = await prisma.institutionApplication.create({
      data: {
        applicantUserId: user.id,
        institutionName: input.institutionName,
        institutionCode: input.institutionCode.toUpperCase(),
        officialEmail: input.officialEmail.toLowerCase(),
        websiteUrl: input.websiteUrl,
        status: "PENDING",
      },
    });

    await auditService.log({
      userId: user.id,
      action: "ISSUER_APPLICATION_SUBMITTED",
      entityType: "InstitutionApplication",
      entityId: application.id,
      metadata: { institutionName: input.institutionName, code: input.institutionCode },
    });

    return {
      message: "Application submitted successfully. It will be reviewed by the platform administrator.",
      applicationId: application.id,
    };
  }

  async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { institution: true },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS: Invalid email or password");
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS: Invalid email or password");
    }

    if (user.status === "PENDING") {
      throw new Error("ACCOUNT_PENDING: Your institution application is pending review by the administrator");
    }

    if (user.status === "SUSPENDED" || user.status === "REJECTED") {
      throw new Error("ACCOUNT_SUSPENDED: Your account has been suspended or rejected. Please contact support.");
    }

    const { accessToken, rawRefreshToken, tokenHash, expiresAt } = this.generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await auditService.log({
      userId: user.id,
      action: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        institutionId: user.institutionId,
        institutionName: user.institution?.name || null,
        institutionCode: user.institution?.code || null,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new Error("TOKEN_REQUIRED: Refresh token required");
    }

    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH_TOKEN: Session expired or invalid");
    }

    if (session.user.status !== "ACTIVE") {
      throw new Error("ACCOUNT_INACTIVE: Account is not active");
    }

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const { accessToken, rawRefreshToken: newRawRefresh, tokenHash: newTokenHash, expiresAt } =
      this.generateTokens(session.user);

    await prisma.refreshToken.create({
      data: {
        userId: session.user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRawRefresh,
    };
  }

  async logout(rawRefreshToken?: string, user?: AuthenticatedUser) {
    if (rawRefreshToken) {
      const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }

    if (user) {
      await auditService.log({
        userId: user.id,
        action: "USER_LOGGED_OUT",
        entityType: "User",
        entityId: user.id,
      });
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        institution: true,
        studentProfile: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND: User not found");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      institutionId: user.institutionId,
      institution: user.institution
        ? {
            id: user.institution.id,
            name: user.institution.name,
            code: user.institution.code,
            contactEmail: user.institution.contactEmail,
            walletAddress: user.institution.walletAddress,
          }
        : null,
      studentProfile: user.studentProfile || null,
    };
  }
}

export const authService = new AuthService();
