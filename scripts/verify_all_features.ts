import {
  simulateLogin,
  simulateVerify,
  simulateIssueCertificate,
  simulateRevokeCertificate,
  getStoredCertificates,
  getStoredApplications,
  simulateApproveApplication,
  simulateHealthCheck,
  computeBrowserSha256,
} from "../frontend/src/services/mockData";

async function runFullSystemVerification() {
  console.log("==========================================================");
  console.log("🚀 STARTING CERTICHAIN FULL-SYSTEM FEATURE VERIFICATION");
  console.log("==========================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, details || "");
      process.exitCode = 1;
    }
  }

  // 1. Test Authentication & Multi-Role Login
  console.log("\n🔑 [1/6] Testing Multi-Role Authentication...");
  const adminLogin = await simulateLogin("admin@certichain.io");
  assert(adminLogin.user.role === "SUPER_ADMIN", "Super Admin Login yields SUPER_ADMIN role");
  assert(!!adminLogin.accessToken, "JWT Access Token issued for Super Admin");

  const issuerLogin = await simulateLogin("issuer@mit.edu");
  assert(issuerLogin.user.role === "INSTITUTION_ISSUER", "MIT Issuer Login yields INSTITUTION_ISSUER role");
  assert(issuerLogin.user.institutionCode === "MIT", "Issuer mapped to MIT institution code");

  const studentLogin = await simulateLogin("anjan@student.mit.edu");
  assert(studentLogin.user.role === "STUDENT", "Student Login yields STUDENT role");

  // 2. Test Certificate Creation (Issuance Pipeline)
  console.log("\n📜 [2/6] Testing Certificate Creation & Raw-Byte Hashing...");
  const formData = new FormData();
  formData.append("studentName", "Anjan Shetty");
  formData.append("studentEmail", "anjan@student.mit.edu");
  formData.append("studentIdentifier", "MIT-2026-AI999");
  formData.append("title", "Doctor of Philosophy in Artificial Intelligence");
  formData.append("degree", "Ph.D. Neural Cryptography");
  formData.append("department", "CSAIL / Department of EECS");
  formData.append("cgpaOrGrade", "4.00 / 4.00 (Summa Cum Laude)");
  formData.append("issueDate", "2026-10-23");

  const issuanceResult = await simulateIssueCertificate(formData);
  const createdCert = issuanceResult.certificate;
  assert(!!createdCert.certificateId, `Certificate generated ID: ${createdCert.certificateId}`);
  assert(createdCert.documentSha256.length === 64, `SHA-256 Byte Hash computed: ${createdCert.documentSha256.slice(0, 16)}...`);
  assert(createdCert.status === "ACTIVE", "Certificate status is initialized as ACTIVE");
  assert(Boolean(createdCert.txHash?.startsWith("0x")), `Simulated blockchain transaction hash: ${createdCert.txHash?.slice(0, 18)}...`);

  // 3. Test Verification Pipeline (Authentic Record)
  console.log("\n🔍 [3/6] Testing Verification Pipeline on Newly Created Certificate...");
  const verifyCreated = await simulateVerify(createdCert.certificateId);
  assert(verifyCreated.status === "VERIFIED", `Verification outcome is VERIFIED for ID: ${createdCert.certificateId}`);
  assert(verifyCreated.integrity.hashMatched === true, "Document hash matches on-chain registration");
  assert(verifyCreated.fraudRisk.classification === "VERY_LOW", `Risk classification is VERY_LOW (Score: ${verifyCreated.fraudRisk.riskScore}/100)`);
  assert(verifyCreated.certificate?.studentName === "Anjan Shetty", "Student recipient correctly decoded");

  // 4. Test Verification of Seeded MIT Certificate CERT-2026-000789
  console.log("\n🎓 [4/6] Testing Seeded Certificate CERT-2026-000789...");
  const verifySeed789 = await simulateVerify("CERT-2026-000789");
  assert(verifySeed789.status === "VERIFIED", "CERT-2026-000789 verified as authentic");
  assert(verifySeed789.certificate?.degree === "M.Sc Blockchain & Cryptography", "Degree verified as M.Sc Blockchain & Cryptography");

  // 5. Test Tamper Detection & Fraud Analysis
  console.log("\n🚨 [5/6] Testing Tamper Detection Engine...");
  const tamperResult = await simulateVerify("TAMPER-TEST-999");
  assert(tamperResult.status === "TAMPERED", "Tampered certificate correctly flagged as TAMPERED");
  assert(tamperResult.integrity.hashMatched === false, "Hash mismatch detected");
  assert(tamperResult.fraudRisk.riskScore > 80, `High Fraud Risk Score flagged (${tamperResult.fraudRisk.riskScore}/100)`);
  assert(tamperResult.fraudRisk.classification === "CRITICAL", "Risk classification elevated to CRITICAL");

  // 6. Test Revocation Workflow
  console.log("\n⚠️ [6/6] Testing On-Chain Revocation Workflow...");
  const revokeResult = simulateRevokeCertificate(createdCert.certificateId, "Candidate opted for dual-degree program upgrade");
  assert(revokeResult.success === true, "Revocation transaction succeeded");
  assert(revokeResult.certificate.status === "REVOKED", "Status updated to REVOKED in state machine");

  const verifyRevoked = await simulateVerify(createdCert.certificateId);
  assert(verifyRevoked.status === "REVOKED", "Verification outcome reflects REVOKED status immediately");
  assert(verifyRevoked.fraudRisk.riskScore >= 70, `Revocation elevated fraud risk score (${verifyRevoked.fraudRisk.riskScore}/100)`);

  // Summary
  console.log("\n==========================================================");
  console.log(`🏁 FEATURE VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==========================================================");
}

runFullSystemVerification().catch(console.error);
