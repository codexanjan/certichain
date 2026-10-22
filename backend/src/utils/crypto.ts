import * as crypto from "crypto";
import { ethers } from "ethers";

/**
 * Calculates SHA-256 hash strictly from the raw bytes of the file.
 * Returns standard 64-character lowercase hex string.
 */
export function calculateSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
}

/**
 * Derives a deterministic bytes32 on-chain lookup key from a Certificate ID.
 */
export function deriveOnChainKey(certificateId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(certificateId));
}

/**
 * Converts a 64-character SHA-256 hex string into an EVM-compatible bytes32 string.
 */
export function hashToBytes32(hashHex: string): string {
  return hashHex.startsWith("0x") ? hashHex : `0x${hashHex}`;
}

/**
 * Generates an unguessable, structured Certificate ID:
 * Format: CERT-{YEAR}-{6 RANDOM HEX DIGITS}
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${randomHex}`;
}

/**
 * Hashes an IP address with a salt for privacy-preserving verification analytics.
 */
export function anonymizeIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "certichain_salt_2026").digest("hex").slice(0, 16);
}
