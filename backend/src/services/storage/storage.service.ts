import * as fs from "fs";
import * as path from "path";
import { config } from "../../config";
import { logger } from "../../utils/logger";

export class StorageService {
  private baseStoragePath: string;

  constructor() {
    this.baseStoragePath = path.resolve(config.LOCAL_STORAGE_PATH);
    if (!fs.existsSync(this.baseStoragePath)) {
      fs.mkdirSync(this.baseStoragePath, { recursive: true });
    }
  }

  /**
   * Saves raw PDF buffer into protected storage directory.
   * Returns storage key (relative file path).
   */
  async saveCertificatePdf(certificateId: string, buffer: Buffer): Promise<string> {
    const safeId = certificateId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${safeId}_${Date.now()}.pdf`;
    const fullPath = path.join(this.baseStoragePath, fileName);

    await fs.promises.writeFile(fullPath, buffer);
    logger.info(`Certificate PDF saved to protected storage`, { certificateId, path: fullPath });
    return fullPath;
  }

  /**
   * Retrieves PDF buffer from protected storage.
   */
  async getCertificatePdf(storageKey: string): Promise<Buffer> {
    const fullPath = path.resolve(storageKey);
    // Path traversal check
    if (!fullPath.startsWith(this.baseStoragePath) && !fs.existsSync(fullPath)) {
      throw new Error("ACCESS_DENIED: Invalid storage path");
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error("FILE_NOT_FOUND: The requested certificate document does not exist");
    }

    return fs.promises.readFile(fullPath);
  }
}

export const storageService = new StorageService();
