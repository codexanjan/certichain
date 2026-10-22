import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("--------------------------------------------------");
  console.log("Seeding CertiChain Database...");
  console.log("--------------------------------------------------");

  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@certichain.io";
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "AdminSecret2026!";
  const adminName = process.env.BOOTSTRAP_ADMIN_NAME || "CertiChain System Administrator";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const commonPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Seed Super Admin
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, fullName: adminName, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: adminName,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`[Seed] Super Admin initialized: ${admin.email}`);

  // 2. Seed Institutions
  const mit = await prisma.institution.upsert({
    where: { code: "MIT" },
    update: { name: "Massachusetts Institute of Technology", contactEmail: "registrar@mit.edu" },
    create: {
      name: "Massachusetts Institute of Technology",
      code: "MIT",
      contactEmail: "registrar@mit.edu",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      status: "ACTIVE",
    },
  });

  const stanford = await prisma.institution.upsert({
    where: { code: "STANFORD" },
    update: { name: "Stanford University", contactEmail: "records@stanford.edu" },
    create: {
      name: "Stanford University",
      code: "STANFORD",
      contactEmail: "records@stanford.edu",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      status: "ACTIVE",
    },
  });
  console.log(`[Seed] Institutions seeded: ${mit.name}, ${stanford.name}`);

  // 3. Seed Institution Issuers
  const mitIssuer = await prisma.user.upsert({
    where: { email: "issuer@mit.edu" },
    update: { institutionId: mit.id, role: "INSTITUTION_ISSUER", status: "ACTIVE" },
    create: {
      email: "issuer@mit.edu",
      passwordHash: commonPasswordHash,
      fullName: "Prof. Arthur Pendelton",
      role: "INSTITUTION_ISSUER",
      status: "ACTIVE",
      institutionId: mit.id,
    },
  });

  const stanfordIssuer = await prisma.user.upsert({
    where: { email: "issuer@stanford.edu" },
    update: { institutionId: stanford.id, role: "INSTITUTION_ISSUER", status: "ACTIVE" },
    create: {
      email: "issuer@stanford.edu",
      passwordHash: commonPasswordHash,
      fullName: "Dr. Evelyn Vance",
      role: "INSTITUTION_ISSUER",
      status: "ACTIVE",
      institutionId: stanford.id,
    },
  });
  console.log(`[Seed] Institution Issuers seeded: ${mitIssuer.email}, ${stanfordIssuer.email}`);

  // 4. Seed Student User & Profile
  const studentUser = await prisma.user.upsert({
    where: { email: "anjan@student.mit.edu" },
    update: { role: "STUDENT", status: "ACTIVE", institutionId: mit.id },
    create: {
      email: "anjan@student.mit.edu",
      passwordHash: commonPasswordHash,
      fullName: "Anjan Shetty",
      role: "STUDENT",
      status: "ACTIVE",
      institutionId: mit.id,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      institutionId_studentIdentifier: {
        institutionId: mit.id,
        studentIdentifier: "MIT-2026-CS001",
      },
    },
    update: { userId: studentUser.id, fullName: "Anjan Shetty", email: "anjan@student.mit.edu" },
    create: {
      institutionId: mit.id,
      userId: studentUser.id,
      studentIdentifier: "MIT-2026-CS001",
      fullName: "Anjan Shetty",
      email: "anjan@student.mit.edu",
    },
  });
  console.log(`[Seed] Student Profile seeded: ${studentProfile.fullName} (${studentProfile.studentIdentifier})`);

  // Ensure storage directory exists
  const storageDir = path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage/certificates");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Create a synthetic valid PDF fixture file if not present
  const demoPdfContent = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Title (Academic Degree Certificate) /Author (CertiChain) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
  );
  const demoSha256 = crypto.createHash("sha256").update(demoPdfContent).digest("hex");
  const demoFileName = `seed_cert_2026_000123.pdf`;
  const demoFilePath = path.join(storageDir, demoFileName);
  fs.writeFileSync(demoFilePath, demoPdfContent);

  const certId = "CERT-2026-000123";
  const onChainKey = ethers.keccak256(ethers.toUtf8Bytes(certId));

  const demoCert = await prisma.certificate.upsert({
    where: { certificateId: certId },
    update: {
      title: "Bachelor of Technology in Artificial Intelligence & Data Science",
      degree: "B.Tech AI & Data Science",
      department: "School of Engineering",
      cgpaOrGrade: "9.85 / 10.00",
      status: "ACTIVE",
      documentSha256: demoSha256,
      documentStorageKey: demoFilePath,
      onChainKey,
      txHash: "0x82b4a7d1e3c590f23485719283746152019a8b7c6d5e4f3a2b1c0d9e8f7a6b5c",
      blockNumber: 1,
    },
    create: {
      certificateId: certId,
      studentProfileId: studentProfile.id,
      institutionId: mit.id,
      title: "Bachelor of Technology in Artificial Intelligence & Data Science",
      degree: "B.Tech AI & Data Science",
      department: "School of Engineering",
      cgpaOrGrade: "9.85 / 10.00",
      issueDate: new Date("2026-06-15T00:00:00.000Z"),
      documentStorageKey: demoFilePath,
      documentSha256: demoSha256,
      onChainKey,
      status: "ACTIVE",
      blockchainNetwork: "hardhat",
      txHash: "0x82b4a7d1e3c590f23485719283746152019a8b7c6d5e4f3a2b1c0d9e8f7a6b5c",
      blockNumber: 1,
    },
  });
  console.log(`[Seed] Demo Certificate seeded: ${demoCert.certificateId} (${demoCert.title})`);

  // Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_SEEDED",
      entityType: "System",
      entityId: "init",
      metadata: JSON.stringify({ note: "Initial seed data loaded successfully" }),
    },
  });

  console.log("--------------------------------------------------");
  console.log("Seeding completed successfully.");
  console.log("Demo Credentials:");
  console.log("  Super Admin: admin@certichain.io / AdminSecret2026!");
  console.log("  MIT Issuer:  issuer@mit.edu / Password123!");
  console.log("  Student:     anjan@student.mit.edu / Password123!");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
