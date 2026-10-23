import { Certificate, User, VerificationResult, FraudAnalysisResult } from "../types";

// Persistent localStorage keys
const STORAGE_CERTS_KEY = "certichain_sim_certificates";
const STORAGE_APPS_KEY = "certichain_sim_applications";
const STORAGE_USERS_KEY = "certichain_sim_users";
const STORAGE_CURRENT_USER_KEY = "certichain_sim_current_user";

// Default Seed Certificates
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "cert-001",
    certificateId: "CERT-2026-000123",
    studentProfileId: "sp-001",
    institutionId: "inst-001",
    title: "Bachelor of Technology in Artificial Intelligence & Data Science",
    degree: "B.Tech AI & Data Science",
    department: "School of Engineering",
    cgpaOrGrade: "9.85 / 10.00",
    issueDate: "2026-06-15T00:00:00.000Z",
    documentSha256: "8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    status: "ACTIVE",
    blockchainNetwork: "hardhat",
    txHash: "0x82b4a7d1e3c590f23485719283746152019a8b7c6d5e4f3a2b1c0d9e8f7a6b5c",
    blockNumber: 104,
    createdAt: "2026-06-15T10:00:00.000Z",
    institution: {
      name: "Massachusetts Institute of Technology",
      code: "MIT",
    },
    studentProfile: {
      fullName: "Anjan Shetty",
      studentIdentifier: "MIT-2026-CS001",
      email: "anjan@student.mit.edu",
    },
    verificationUrl: "https://frontend-teal-seven-45.vercel.app/verify/CERT-2026-000123",
  },
  {
    id: "cert-002",
    certificateId: "CERT-2026-000456",
    studentProfileId: "sp-002",
    institutionId: "inst-002",
    title: "Master of Science in Autonomous Systems",
    degree: "M.Sc Autonomous Systems",
    department: "Department of Robotics",
    cgpaOrGrade: "8.90 / 10.00",
    issueDate: "2026-05-10T00:00:00.000Z",
    documentSha256: "3f7b2c9a1d5e8f0a4b6c8d2e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a",
    status: "REVOKED",
    blockchainNetwork: "hardhat",
    txHash: "0x4a9b2c1d3e5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    blockNumber: 98,
    revokedAt: "2026-08-01T14:30:00.000Z",
    revocationReason: "Administrative student record cancellation and credit revision",
    createdAt: "2026-05-10T09:00:00.000Z",
    institution: {
      name: "Stanford University",
      code: "STANFORD",
    },
    studentProfile: {
      fullName: "Sarah Connor",
      studentIdentifier: "STANFORD-2026-AI042",
      email: "sarah@stanford.edu",
    },
    verificationUrl: "https://frontend-teal-seven-45.vercel.app/verify/CERT-2026-000456",
  },
  {
    id: "cert-003",
    certificateId: "CERT-2026-000789",
    studentProfileId: "sp-001",
    institutionId: "inst-001",
    title: "Master of Science in Distributed Ledger Technology & Cryptography",
    degree: "M.Sc Blockchain & Cryptography",
    department: "School of Computing",
    cgpaOrGrade: "9.92 / 10.00",
    issueDate: "2026-10-23T00:00:00.000Z",
    documentSha256: "9f2b8c4d7a1e3f5a7b9c1d3e5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    status: "ACTIVE",
    blockchainNetwork: "hardhat",
    txHash: "0x71a3e9c2b4d8f01a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a8b9c0d1e2f3a",
    blockNumber: 115,
    createdAt: "2026-10-23T09:00:00.000Z",
    institution: {
      name: "Massachusetts Institute of Technology",
      code: "MIT",
    },
    studentProfile: {
      fullName: "Anjan Shetty",
      studentIdentifier: "MIT-2026-CS001",
      email: "anjan@student.mit.edu",
    },
    verificationUrl: "https://frontend-teal-seven-45.vercel.app/verify/CERT-2026-000789",
  },
];

// Default Seed Users
const DEFAULT_USERS: User[] = [
  {
    id: "user-admin",
    email: "admin@certichain.io",
    fullName: "CertiChain System Administrator",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  },
  {
    id: "user-mit-issuer",
    email: "issuer@mit.edu",
    fullName: "Prof. Arthur Pendelton",
    role: "INSTITUTION_ISSUER",
    status: "ACTIVE",
    institutionId: "inst-001",
    institutionName: "Massachusetts Institute of Technology",
    institutionCode: "MIT",
  },
  {
    id: "user-stanford-issuer",
    email: "issuer@stanford.edu",
    fullName: "Dr. Evelyn Vance",
    role: "INSTITUTION_ISSUER",
    status: "ACTIVE",
    institutionId: "inst-002",
    institutionName: "Stanford University",
    institutionCode: "STANFORD",
  },
  {
    id: "user-student",
    email: "anjan@student.mit.edu",
    fullName: "Anjan Shetty",
    role: "STUDENT",
    status: "ACTIVE",
    institutionId: "inst-001",
    institutionName: "Massachusetts Institute of Technology",
    institutionCode: "MIT",
  },
];

// Default Applications
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_APPLICATIONS: any[] = [
  {
    id: "app-001",
    institutionName: "Oxford University",
    institutionCode: "OXFORD",
    officialEmail: "registrar@oxford.ac.uk",
    websiteUrl: "https://oxford.ac.uk",
    status: "PENDING",
    createdAt: "2026-10-20T12:00:00.000Z",
    applicantUser: {
      fullName: "Sir Richard Dawkins",
      email: "richard@oxford.ac.uk",
    },
  },
  {
    id: "app-002",
    institutionName: "Cambridge University",
    institutionCode: "CAMBRIDGE",
    officialEmail: "records@cam.ac.uk",
    websiteUrl: "https://cam.ac.uk",
    status: "APPROVED",
    createdAt: "2026-10-18T10:00:00.000Z",
    applicantUser: {
      fullName: "Dr. Stephen Hawking",
      email: "stephen@cam.ac.uk",
    },
  },
];

export function getStoredCertificates(): Certificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_CERTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveStoredCertificates(DEFAULT_CERTIFICATES);
  return DEFAULT_CERTIFICATES;
}

export function saveStoredCertificates(certs: Certificate[]): void {
  try {
    localStorage.setItem(STORAGE_CERTS_KEY, JSON.stringify(certs));
  } catch {}
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStoredApplications(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_APPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_APPLICATIONS;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveStoredApplications(apps: any[]): void {
  try {
    localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(apps));
  } catch {}
}

/**
 * Computes SHA-256 in browser using native Web Crypto API
 */
export async function computeBrowserSha256(fileOrBuffer: File | Blob | ArrayBuffer | string): Promise<string> {
  let arrayBuffer: ArrayBuffer;
  if (typeof fileOrBuffer === "string") {
    const uint8 = new TextEncoder().encode(fileOrBuffer);
    arrayBuffer = uint8.buffer as ArrayBuffer;
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateRandomHex(length: number): string {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// -------------------------------------------------------------
// SIMULATED API RESPONDERS (Hybrid offline/fallback engine)
// -------------------------------------------------------------

export async function simulateLogin(email: string): Promise<{ user: User; accessToken: string }> {
  const users = getStoredUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Generate appropriate role based on email hint
    if (email.includes("admin")) {
      user = {
        id: `user-${Date.now()}`,
        email,
        fullName: "System Admin",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      };
    } else if (email.includes("mit") || email.includes("issuer")) {
      user = {
        id: `user-${Date.now()}`,
        email,
        fullName: "Academic Registrar",
        role: "INSTITUTION_ISSUER",
        status: "ACTIVE",
        institutionId: "inst-001",
        institutionName: "Massachusetts Institute of Technology",
        institutionCode: "MIT",
      };
    } else {
      user = {
        id: `user-${Date.now()}`,
        email,
        fullName: "Anjan Shetty",
        role: "STUDENT",
        status: "ACTIVE",
        institutionId: "inst-001",
        institutionName: "Massachusetts Institute of Technology",
        institutionCode: "MIT",
      };
    }
    users.push(user);
    saveStoredUsers(users);
  }

  setCurrentUser(user);
  return {
    user,
    accessToken: `sim_token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };
}

export async function simulateRegister(
  fullName: string,
  email: string,
  role: string = "STUDENT"
): Promise<{ user: User; accessToken: string }> {
  const users = getStoredUsers();
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: (role as User["role"]) || "STUDENT",
    status: "ACTIVE",
    institutionId: "inst-001",
    institutionName: "Massachusetts Institute of Technology",
    institutionCode: "MIT",
  };
  users.push(user);
  saveStoredUsers(users);
  setCurrentUser(user);
  return {
    user,
    accessToken: `sim_token_${Date.now()}`,
  };
}

export function simulateAuthMe(): { user: User | null } {
  let user = getCurrentUser();
  if (!user) {
    // Auto-login default issuer or student if none
    user = DEFAULT_USERS[1]; // MIT Issuer
    setCurrentUser(user);
  }
  return { user };
}

export async function simulateVerify(query: string): Promise<VerificationResult> {
  const certs = getStoredCertificates();
  const clean = query.trim().toLowerCase();

  // Explicit Tamper Simulation
  if (clean.includes("tamper") || clean.includes("fake")) {
    return {
      status: "TAMPERED",
      message: "Cryptographic hash mismatch. Document content does not match blockchain record.",
      certificateId: query.toUpperCase(),
      integrity: {
        hashMatched: false,
        registeredHash: "8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
        submittedHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      blockchain: {
        checked: true,
        confirmedOnChain: false,
        network: "Hardhat EVM (Local / Fallback)",
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      },
      fraudRisk: {
        riskScore: 92,
        classification: "CRITICAL",
        reasons: [
          "Document SHA-256 byte payload was modified after issuance",
          "Tampering signature detected in document header stream",
          "Calculated byte digest fails smart contract validation",
        ],
        engineVersion: "1.4.0-simulation",
      },
      verifiedAt: new Date().toISOString(),
    };
  }

  const match = certs.find(
    (c) =>
      c.certificateId.toLowerCase() === clean ||
      c.id.toLowerCase() === clean ||
      c.documentSha256.toLowerCase() === clean
  );

  if (!match) {
    return {
      status: "NOT_FOUND",
      message: "No credential record found for this identifier or SHA-256 cryptographic hash.",
      integrity: {
        hashMatched: false,
        submittedHash: clean.length === 64 ? clean : undefined,
      },
      blockchain: {
        checked: true,
        confirmedOnChain: false,
        network: "Hardhat EVM (Local / Fallback)",
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      },
      fraudRisk: {
        riskScore: 88,
        classification: "CRITICAL",
        reasons: [
          "Record does not exist in the decentralized registry",
          "Unregistered credential may be fraudulent or expired",
        ],
        engineVersion: "1.4.0-simulation",
      },
      verifiedAt: new Date().toISOString(),
    };
  }

  const isRevoked = match.status === "REVOKED";

  return {
    status: isRevoked ? "REVOKED" : "VERIFIED",
    message: isRevoked
      ? `This certificate was REVOKED on ${match.revokedAt ? new Date(match.revokedAt).toLocaleDateString() : "record"}.`
      : "Authentic academic credential cryptographically confirmed on Ethereum Virtual Machine.",
    certificateId: match.certificateId,
    certificate: {
      id: match.id,
      certificateId: match.certificateId,
      title: match.title,
      degree: match.degree,
      department: match.department,
      issueDate: match.issueDate,
      institutionName: match.institution?.name || "Massachusetts Institute of Technology",
      institutionCode: match.institution?.code || "MIT",
      studentName: match.studentProfile?.fullName || "Anjan Shetty",
      documentSha256: match.documentSha256,
      txHash: match.txHash,
      blockNumber: match.blockNumber,
      revokedAt: match.revokedAt,
      revocationReason: match.revocationReason,
    },
    integrity: {
      hashMatched: !isRevoked,
      registeredHash: match.documentSha256,
      submittedHash: match.documentSha256,
    },
    blockchain: {
      checked: true,
      confirmedOnChain: true,
      network: "Hardhat EVM (Local / Fallback)",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      txHash: match.txHash,
    },
    fraudRisk: {
      riskScore: isRevoked ? 78 : 3,
      classification: isRevoked ? "HIGH" : "VERY_LOW",
      reasons: isRevoked
        ? [
            `Credential status is REVOKED on-chain: "${match.revocationReason || "Administrative invalidation"}"`,
            "University revoked authority for this credential",
          ]
        : [
            "SHA-256 byte digest precisely matches immutable contract state",
            "Issuing authority is an active verified partner",
            "Zero cryptographic tampering detected",
          ],
      engineVersion: "1.4.0-simulation",
    },
    verifiedAt: new Date().toISOString(),
  };
}

export async function simulateVerifyFile(file: File): Promise<VerificationResult> {
  const hash = await computeBrowserSha256(file);
  const certs = getStoredCertificates();
  const match = certs.find((c) => c.documentSha256.toLowerCase() === hash.toLowerCase());

  if (match) {
    return simulateVerify(match.certificateId);
  }

  // Not matched = Tampered or Unregistered
  return {
    status: "TAMPERED",
    message: "Uploaded file hash does not match any authenticated blockchain registration.",
    integrity: {
      hashMatched: false,
      submittedHash: hash,
    },
    blockchain: {
      checked: true,
      confirmedOnChain: false,
      network: "Hardhat EVM (Local / Fallback)",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
    fraudRisk: {
      riskScore: 94,
      classification: "CRITICAL",
      reasons: [
        `File SHA-256 digest (${hash.substring(0, 16)}...) was not issued by any registered institution`,
        "Potential document forgery, modified grades, or uncommitted credential",
      ],
      engineVersion: "1.4.0-simulation",
    },
    verifiedAt: new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function simulateIssueCertificate(formData: FormData): Promise<{ certificate: Certificate }> {
  const certs = getStoredCertificates();
  const currentUser = getCurrentUser() || DEFAULT_USERS[1];

  const studentName = (formData.get("studentName") as string) || "Anjan Shetty";
  const studentEmail = (formData.get("studentEmail") as string) || "student@mit.edu";
  const studentIdentifier = (formData.get("studentIdentifier") as string) || "ID-" + Math.floor(1000 + Math.random() * 9000);
  const title = (formData.get("title") as string) || "Bachelor of Technology";
  const degree = (formData.get("degree") as string) || "B.Tech Computer Science";
  const department = (formData.get("department") as string) || "School of Computing";
  const cgpaOrGrade = (formData.get("cgpaOrGrade") as string) || "9.50 / 10.00";
  const issueDate = (formData.get("issueDate") as string) || new Date().toISOString().split("T")[0];

  const file = formData.get("file") as File | null;
  let hash: string;
  if (file && file.size > 0) {
    hash = await computeBrowserSha256(file);
  } else {
    // Generate deterministic sha256
    hash = await computeBrowserSha256(`${studentName}-${title}-${Date.now()}`);
  }

  const certNumber = Math.floor(100000 + Math.random() * 900000);
  const certId = `CERT-2026-${certNumber}`;

  const newCert: Certificate = {
    id: `cert-${Date.now()}`,
    certificateId: certId,
    studentProfileId: `sp-${Date.now()}`,
    institutionId: currentUser.institutionId || "inst-001",
    title,
    degree,
    department,
    cgpaOrGrade,
    issueDate: new Date(issueDate).toISOString(),
    documentSha256: hash,
    status: "ACTIVE",
    blockchainNetwork: "hardhat",
    txHash: generateRandomHex(64),
    blockNumber: 105 + certs.length,
    createdAt: new Date().toISOString(),
    institution: {
      name: currentUser.institutionName || "Massachusetts Institute of Technology",
      code: currentUser.institutionCode || "MIT",
    },
    studentProfile: {
      fullName: studentName,
      studentIdentifier,
      email: studentEmail,
    },
    verificationUrl: `https://frontend-teal-seven-45.vercel.app/verify/${certId}`,
  };

  certs.unshift(newCert);
  saveStoredCertificates(certs);
  return { certificate: newCert };
}

export function simulateRevokeCertificate(certId: string, reason: string): { success: boolean; certificate: Certificate } {
  const certs = getStoredCertificates();
  const idx = certs.findIndex((c) => c.id === certId || c.certificateId === certId);
  if (idx === -1) {
    throw new Error("Certificate not found for revocation");
  }

  certs[idx] = {
    ...certs[idx],
    status: "REVOKED",
    revocationReason: reason || "Administrative revocation",
    revokedAt: new Date().toISOString(),
  };

  saveStoredCertificates(certs);
  return { success: true, certificate: certs[idx] };
}

export function simulateDownloadPdf(certId: string): Blob {
  const certs = getStoredCertificates();
  const cert = certs.find((c) => c.id === certId || c.certificateId === certId) || certs[0];

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${cert.certificateId} - Official Credential Proof</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
    .card { border: 2px solid #0284c7; border-radius: 16px; padding: 40px; max-width: 700px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .title { font-size: 26px; font-weight: 800; color: #0369a1; margin: 8px 0; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-weight: bold; font-size: 12px; }
    .body { margin: 30px 0; font-size: 14px; line-height: 1.6; }
    .hash { font-family: monospace; background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11px; word-break: break-all; border: 1px solid #cbd5e1; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="status">AUTHENTICATED BLOCKCHAIN RECORD</span>
      <div class="title">${cert.institution?.name || "Academic Institution"}</div>
      <p style="margin: 0; color: #64748b;">Official Degree Credential</p>
    </div>
    <div class="body">
      <p>This certifies that <strong>${cert.studentProfile?.fullName || "Recipient"}</strong> has successfully fulfilled all academic requirements for:</p>
      <h2 style="color: #0f172a; margin: 15px 0;">${cert.title}</h2>
      <p><strong>Major:</strong> ${cert.degree} | <strong>GPA:</strong> ${cert.cgpaOrGrade || "N/A"}</p>
      <p><strong>Certificate ID:</strong> ${cert.certificateId}</p>
      <p><strong>Issuance Date:</strong> ${new Date(cert.issueDate).toLocaleDateString()}</p>
      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 20px 0;" />
      <p><strong>Cryptographic SHA-256 Digest:</strong></p>
      <div class="hash">${cert.documentSha256}</div>
      <p style="margin-top: 15px;"><strong>Smart Contract TxHash:</strong></p>
      <div class="hash">${cert.txHash || "0x82b4a7d1e3c590f23485719283746152019a8b7c6d5e4f3a2b1c0d9e8f7a6b5c"}</div>
    </div>
    <div class="footer">
      Verified on EVM Smart Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3<br />
      Verify online: ${cert.verificationUrl || `https://frontend-teal-seven-45.vercel.app/verify/${cert.certificateId}`}
    </div>
  </div>
</body>
</html>`;

  return new Blob([html], { type: "text/html" });
}

export function simulateHealthCheck() {
  return {
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    mode: "hybrid-resilient",
    data: {
      connected: true,
      network: "Hardhat EVM (Local / Fallback)",
      blockNumber: 108,
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
    blockchain: {
      connected: true,
      network: "Hardhat EVM",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
  };
}
