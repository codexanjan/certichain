export type UserRole = "SUPER_ADMIN" | "INSTITUTION_ISSUER" | "STUDENT";
export type Role = UserRole;
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
export type CertificateStatus = "DRAFT" | "PENDING_BLOCKCHAIN" | "ACTIVE" | "REVOKED";
export type VerificationOutcome =
  | "VERIFIED"
  | "TAMPERED"
  | "REVOKED"
  | "NOT_FOUND"
  | "PENDING_BLOCKCHAIN_CONFIRMATION"
  | "BLOCKCHAIN_VERIFICATION_UNAVAILABLE";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  institutionId?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  walletAddress?: string | null;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentProfileId: string;
  institutionId: string;
  title: string;
  degree: string;
  department?: string | null;
  cgpaOrGrade?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  documentSha256: string;
  status: CertificateStatus;
  blockchainNetwork: string;
  txHash?: string | null;
  blockNumber?: number | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  createdAt: string;
  institution?: {
    name: string;
    code: string;
  };
  studentProfile?: {
    fullName: string;
    studentIdentifier: string;
    email: string;
  };
  qrCodeDataUrl?: string;
  verificationUrl?: string;
}

export interface FraudAnalysisResult {
  riskScore: number;
  classification: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  engineVersion: string;
}

export interface VerificationResult {
  status: VerificationOutcome;
  message: string;
  certificateId?: string;
  certificate?: {
    id: string;
    certificateId: string;
    title: string;
    degree: string;
    department?: string | null;
    issueDate: string;
    institutionName: string;
    institutionCode: string;
    studentName: string;
    documentSha256: string;
    txHash?: string | null;
    blockNumber?: number | null;
    revokedAt?: string | null;
    revocationReason?: string | null;
  };
  integrity: {
    hashMatched: boolean;
    registeredHash?: string;
    submittedHash?: string;
  };
  blockchain: {
    checked: boolean;
    confirmedOnChain: boolean;
    network: string;
    contractAddress?: string;
    txHash?: string | null;
  };
  fraudRisk: FraudAnalysisResult;
  verifiedAt: string;
}
