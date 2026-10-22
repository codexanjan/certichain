import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/utils/db";

const { app } = createApp();

describe("CertiChain REST API Integration Tests", () => {
  let studentAccessToken = "";
  let issuerAccessToken = "";
  const testStudentEmail = `test_student_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Ensure DB is connected
    await prisma.$connect();
  });

  describe("System Health", () => {
    it("GET /api/v1/health should return 200 OK", async () => {
      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("operational");
    });
  });

  describe("Authentication & RBAC", () => {
    it("POST /api/v1/auth/register should create a new student account", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Test Graduate",
        email: testStudentEmail,
        password: "Password123!",
        role: "STUDENT",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudentEmail);
      expect(res.body.data.accessToken).toBeDefined();
      studentAccessToken = res.body.data.accessToken;
    });

    it("POST /api/v1/auth/register should reject duplicate email", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Duplicate User",
        email: testStudentEmail,
        password: "Password123!",
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/v1/auth/login should authenticate MIT issuer successfully", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "issuer@mit.edu",
        password: "Password123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("INSTITUTION_ISSUER");
      expect(res.body.data.accessToken).toBeDefined();
      issuerAccessToken = res.body.data.accessToken;
    });

    it("POST /api/v1/auth/login should reject invalid password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "issuer@mit.edu",
        password: "WrongPassword999!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/v1/auth/me should return authenticated profile", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${issuerAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe("issuer@mit.edu");
    });
  });

  describe("Public Verification Pipeline", () => {
    it("GET /api/v1/verify/:certificateId should verify seeded certificate", async () => {
      const res = await request(app).get("/api/v1/verify/CERT-2026-000123");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificateId).toBe("CERT-2026-000123");
      expect(["VERIFIED", "BLOCKCHAIN_VERIFICATION_UNAVAILABLE"]).toContain(res.body.data.status);
      expect(res.body.data.integrity.hashMatched).toBe(true);
    });

    it("GET /api/v1/verify/:certificateId should return NOT_FOUND for unknown certificate", async () => {
      const res = await request(app).get("/api/v1/verify/CERT-NONEXISTENT-99999");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("NOT_FOUND");
      expect(res.body.data.message).toContain("No matching certificate record");
    });

    it("POST /api/v1/verify/upload should detect TAMPERED document when hash differs", async () => {
      // Create a modified synthetic PDF with different bytes
      const tamperedPdfBuffer = Buffer.from("%PDF-1.4 FORGED CERTIFICATE CONTENT TAMPERED");

      const res = await request(app)
        .post("/api/v1/verify/upload")
        .field("certificateId", "CERT-2026-000123")
        .attach("file", tamperedPdfBuffer, "tampered.pdf");

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("TAMPERED");
      expect(res.body.data.integrity.hashMatched).toBe(false);
      expect(res.body.data.fraudRisk.riskScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Certificate Issuance & Revocation", () => {
    let newlyIssuedCertId = "";

    it("POST /api/v1/certificates should issue a new certificate by authorized issuer", async () => {
      const validPdf = Buffer.from("%PDF-1.4 Official University Degree in Cybersecurity");

      const res = await request(app)
        .post("/api/v1/certificates")
        .set("Authorization", `Bearer ${issuerAccessToken}`)
        .field("studentName", "Bruce Wayne")
        .field("studentIdentifier", `STUDENT-${Date.now()}`)
        .field("studentEmail", `bruce_${Date.now()}@wayne.com`)
        .field("title", "Master of Science in Cybersecurity")
        .field("degree", "M.Sc Cybersecurity")
        .field("issueDate", new Date().toISOString())
        .attach("file", validPdf, "cyber_degree.pdf");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificate.certificateId).toBeDefined();
      newlyIssuedCertId = res.body.data.certificate.certificateId;
      expect(res.body.data.qrCodeDataUrl).toBeDefined();
    });

    it("POST /api/v1/certificates/:id/revoke should revoke an issued certificate", async () => {
      const res = await request(app)
        .post(`/api/v1/certificates/${newlyIssuedCertId}/revoke`)
        .set("Authorization", `Bearer ${issuerAccessToken}`)
        .send({ reason: "Administrative re-issuance due to typo" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificate.status).toBe("REVOKED");

      // Now verify public lookup returns REVOKED
      const verifyRes = await request(app).get(`/api/v1/verify/${newlyIssuedCertId}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.status).toBe("REVOKED");
    });

    it("Student should not have permission to issue certificates (RBAC 403)", async () => {
      const validPdf = Buffer.from("%PDF-1.4 Fake Attempt");
      const res = await request(app)
        .post("/api/v1/certificates")
        .set("Authorization", `Bearer ${studentAccessToken}`)
        .field("studentName", "Student Hacker")
        .field("studentIdentifier", "FAKE-001")
        .field("studentEmail", "hacker@test.com")
        .field("title", "Fake Degree")
        .field("degree", "B.S.")
        .field("issueDate", new Date().toISOString())
        .attach("file", validPdf, "fake.pdf");

      expect(res.status).toBe(403);
    });
  });
});
