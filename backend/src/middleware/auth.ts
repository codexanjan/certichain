import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../utils/db";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  institutionId?: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication token required" },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as {
      sub: string;
      email: string;
      role: string;
      institutionId?: string | null;
    };

    // Check account status in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true, institutionId: true },
    });

    if (!user || user.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "User account is suspended, pending, or inactive" },
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired authentication token" },
    });
  }
}
