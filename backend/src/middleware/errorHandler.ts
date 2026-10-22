import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error("Unhandled API Error", {
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
  });

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Error && err.message.startsWith("INVALID_FILE_TYPE")) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: err.message.replace("INVALID_FILE_TYPE: ", ""),
      },
    });
    return;
  }

  // Generic sanitized server error
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    },
  });
}
