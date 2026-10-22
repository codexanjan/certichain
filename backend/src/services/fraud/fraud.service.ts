export interface FraudEvaluationInput {
  certificateFound: boolean;
  hashMatched: boolean;
  isRevoked: boolean;
  issuerStatus?: string; // "ACTIVE" | "SUSPENDED" | "UNKNOWN"
  issueDate?: Date | string;
  certificateId?: string;
  hasValidPdfHeader?: boolean;
}

export interface FraudAnalysisResult {
  riskScore: number;
  classification: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  engineVersion: string;
}

export class FraudDetectionService {
  private readonly version = "v1.0-rules";

  evaluate(input: FraudEvaluationInput): FraudAnalysisResult {
    let score = 0;
    const reasons: string[] = [];

    // Check 1: Document Hash Mismatch
    if (!input.hashMatched && input.certificateFound) {
      score += 85;
      reasons.push("Document SHA-256 hash does not match the immutable blockchain proof (Altered Document).");
    }

    // Check 2: Revocation Status
    if (input.isRevoked) {
      score += 90;
      reasons.push("Certificate has been formally revoked by the issuing institution.");
    }

    // Check 3: Certificate ID Existence
    if (!input.certificateFound) {
      score += 70;
      reasons.push("Certificate identifier was not found in the institution registry.");
    }

    // Check 4: Issuer Legitimacy
    if (input.issuerStatus && input.issuerStatus !== "ACTIVE") {
      score += 45;
      reasons.push(`Issuing institution is marked as ${input.issuerStatus}.`);
    }

    // Check 5: Issue Date Temporal Consistency
    if (input.issueDate) {
      const issueTime = new Date(input.issueDate).getTime();
      const now = Date.now();
      if (issueTime > now + 24 * 60 * 60 * 1000) {
        score += 30;
        reasons.push("Certificate issue date is set in the future.");
      }
    }

    // Check 6: PDF Structure / Header
    if (input.hasValidPdfHeader === false) {
      score += 25;
      reasons.push("File binary header does not conform to standard PDF specifications.");
    }

    // Check 7: ID Structure
    if (input.certificateId && !input.certificateId.startsWith("CERT-")) {
      score += 20;
      reasons.push("Certificate ID does not follow institutional naming standards.");
    }

    // If completely clean
    if (score === 0) {
      reasons.push("All cryptographic hashes match registered on-chain records.");
      reasons.push("Issuing institution is verified and active.");
      reasons.push("Document structural metadata is consistent.");
    }

    // Clamp score to 0 - 100
    const finalScore = Math.min(Math.max(score, 0), 100);

    let classification: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (finalScore <= 20) {
      classification = "VERY_LOW";
    } else if (finalScore <= 40) {
      classification = "LOW";
    } else if (finalScore <= 60) {
      classification = "MEDIUM";
    } else if (finalScore <= 80) {
      classification = "HIGH";
    } else {
      classification = "CRITICAL";
    }

    return {
      riskScore: finalScore,
      classification,
      reasons,
      engineVersion: this.version,
    };
  }
}

export const fraudDetectionService = new FraudDetectionService();
