import * as dotenv from "dotenv";
import { z } from "zod";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Also load root .env if available
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("5000").transform(Number),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_ACCESS_SECRET: z.string().min(16).default("certichain_jwt_super_access_secret_key_32_bytes_min_2026!"),
  JWT_REFRESH_SECRET: z.string().min(16).default("certichain_jwt_super_refresh_secret_key_32_bytes_min_2026!"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:3000"),
  BLOCKCHAIN_NETWORK: z.string().default("hardhat"),
  BLOCKCHAIN_RPC_URL: z.string().default("http://127.0.0.1:8545"),
  BLOCKCHAIN_PRIVATE_KEY: z.string().default("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
  CONTRACT_ADDRESS: z.string().default("0x5FbDB2315678afecb367f032d93F642f64180aa3"),
  LOCAL_STORAGE_PATH: z.string().default("./storage/certificates"),
  MAX_UPLOAD_SIZE_MB: z.string().default("10").transform(Number),
  BOOTSTRAP_ADMIN_EMAIL: z.string().default("admin@certichain.io"),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().default("AdminSecret2026!"),
  BOOTSTRAP_ADMIN_NAME: z.string().default("CertiChain System Administrator"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration validation error:", parsed.error.format());
  throw new Error("Invalid application configuration");
}

export const config = parsed.data;
