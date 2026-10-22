import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth/auth.service";
import { registerSchema, issuerApplicationSchema, loginSchema } from "../validators/auth.validator";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.registerStudent(validated);

      // Set refresh cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: "Student account created successfully",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async submitIssuerApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = issuerApplicationSchema.parse(req.body);
      const result = await authService.submitIssuerApplication(validated);
      res.status(202).json({
        success: true,
        message: result.message,
        data: { applicationId: result.applicationId },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated.email, validated.password);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.startsWith("INVALID_CREDENTIALS") ||
          error.message.startsWith("ACCOUNT_PENDING") ||
          error.message.startsWith("ACCOUNT_SUSPENDED"))
      ) {
        res.status(401).json({
          success: false,
          error: {
            code: error.message.split(":")[0],
            message: error.message.split(": ")[1],
          },
        });
        return;
      }
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refresh(refreshToken);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: { accessToken: result.accessToken },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_REFRESH_TOKEN", message: "Session expired or invalid" },
      });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(refreshToken, req.user);
      res.clearCookie("refreshToken");
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
        return;
      }
      const user = await authService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
