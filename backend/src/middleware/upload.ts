import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE: Only official PDF documents are accepted"));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});

export const uploadSinglePdf = upload.single("file");

/**
 * Middleware to enforce PDF magic-bytes (%PDF-) verification on buffer.
 */
export function validatePdfMagicBytes(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: "MISSING_FILE", message: "PDF document file is required" },
    });
    return;
  }

  const buffer = req.file.buffer;
  // %PDF- magic bytes: 0x25 0x50 0x44 0x46
  if (
    buffer.length < 4 ||
    buffer[0] !== 0x25 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x44 ||
    buffer[3] !== 0x46
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PDF_HEADER",
        message: "The uploaded file does not contain valid PDF header magic bytes",
      },
    });
    return;
  }

  next();
}
