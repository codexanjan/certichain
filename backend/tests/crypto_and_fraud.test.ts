import { describe, it, expect } from "vitest";
import { calculateSha256, deriveOnChainKey, generateCertificateId } from "../src/utils/crypto";
import { fraudDetectionService } from "../src/services/fraud/fraud.service";

describe("Cryptographic Utilities & Integrity Hashing", () => {
  it("should calculate identical SHA-256 for identical byte buffers", () => {
    const buffer1 = Buffer.from("%PDF-1.4 Official Certificate Content");
    const buffer2 = Buffer.from("%PDF-1.4 Official Certificate Content");
    expect(calculateSha256(buffer1)).toBe(calculateSha256(buffer2));
  });

  it("should calculate completely different SHA-256 when a single byte is changed (avalanche effect)", () => {
    const original = Buffer.from("%PDF-1.4 Grade: A; Student: Alice");
    const tampered = Buffer.from("%PDF-1.4 Grade: B; Student: Alice");

    const originalHash = calculateSha256(original);
    const tamperedHash = calculateSha256(tampered);

    expect(originalHash).not.toBe(tamperedHash);
    expect(originalHash).toHaveLength(64);
    expect(tamperedHash).toHaveLength(64);
  });

  it("should generate structured certificate IDs", () => {
    const id = generateCertificateId();
    expect(id).toMatch(/^CERT-\d{4}-[A-F0-9]{8}$/);
  });

  it("should derive deterministic bytes32 on-chain keys", () => {
    const id = "CERT-2026-TEST123";
    const key1 = deriveOnChainKey(id);
    const key2 = deriveOnChainKey(id);
    expect(key1).toBe(key2);
    expect(key1).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});

describe("Explainable Fraud Detection Engine", () => {
  it("should assign VERY_LOW risk score (<= 20) for verified, clean certificates", () => {
    const result = fraudDetectionService.evaluate({
      certificateFound: true,
      hashMatched: true,
      isRevoked: false,
      issuerStatus: "ACTIVE",
      issueDate: new Date("2026-01-01"),
      certificateId: "CERT-2026-000123",
      hasValidPdfHeader: true,
    });

    expect(result.riskScore).toBeLessThanOrEqual(20);
    expect(result.classification).toBe("VERY_LOW");
    expect(result.reasons).toContain("All cryptographic hashes match registered on-chain records.");
  });

  it("should assign CRITICAL / HIGH risk score (>= 80) for tampered documents (hash mismatch)", () => {
    const result = fraudDetectionService.evaluate({
      certificateFound: true,
      hashMatched: false,
      isRevoked: false,
      issuerStatus: "ACTIVE",
      issueDate: new Date("2026-01-01"),
      certificateId: "CERT-2026-000123",
      hasValidPdfHeader: true,
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(80);
    expect(["HIGH", "CRITICAL"]).toContain(result.classification);
    expect(result.reasons.some((r) => r.includes("does not match the immutable blockchain proof"))).toBe(true);
  });

  it("should assign CRITICAL risk score for revoked certificates", () => {
    const result = fraudDetectionService.evaluate({
      certificateFound: true,
      hashMatched: true,
      isRevoked: true,
      issuerStatus: "ACTIVE",
      certificateId: "CERT-2026-000123",
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(90);
    expect(result.classification).toBe("CRITICAL");
    expect(result.reasons.some((r) => r.includes("revoked"))).toBe(true);
  });

  it("should flag NOT FOUND as unknown without pretending to prove document forgery", () => {
    const result = fraudDetectionService.evaluate({
      certificateFound: false,
      hashMatched: false,
      isRevoked: false,
      certificateId: "CERT-UNKNOWN-9999",
    });

    expect(result.reasons.some((r) => r.includes("not found"))).toBe(true);
  });
});
