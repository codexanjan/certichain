import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  QrCode,
  Lock,
  ArrowRight,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  ExternalLink,
  School,
  GraduationCap,
  FileCheck2,
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResult } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { RiskGauge } from "../components/RiskGauge";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("CERT-2026-000123");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async (queryToVerify?: string) => {
    const q = (queryToVerify || searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.get<{ success: boolean; data: VerificationResult }>(
        `/verify/${encodeURIComponent(q)}`
      );
      setVerificationResult(res.data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Verification request failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePillClick = (id: string) => {
    setSearchQuery(id);
    handleVerify(id);
  };

  return (
    <div className="relative overflow-hidden space-y-24 pb-24">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-28 right-1/4 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-60 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* 1. HERO SECTION (21st.dev / Framer Motion Aesthetic) */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          {/* Logo Brand Header & Pill Badge */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-glow bg-navy-900 border border-brand-500/40 p-1 flex items-center justify-center cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="CertiChain Brand Logo"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <ShieldCheck className="w-8 h-8 text-brand-400 absolute" style={{ zIndex: -1 }} />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EVM Cryptographic Protocol · Zero PII on Chain</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Decentralized Proof of Degree. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500">
              Zero Counterfeits. Instant Trust.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Enterprise academic credentialing network uniting accredited universities, graduates, and global verifiers with millisecond cryptographic verification.
          </p>

          {/* Search Bar / Real-Time Live Verification Console */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative p-2 rounded-2xl bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="Enter Certificate ID or SHA-256 Hash..."
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Querying Chain...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify Record</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Test Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick Demo Records:</span>
              <button
                type="button"
                onClick={() => handlePillClick("CERT-2026-000123")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-semibold transition"
              >
                MIT B.Tech (CERT-2026-000123)
              </button>
              <button
                type="button"
                onClick={() => handlePillClick("CERT-2026-000789")}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold transition"
              >
                MIT M.Sc New (CERT-2026-000789)
              </button>
              <button
                type="button"
                onClick={() => handlePillClick("CERT-2026-000456")}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono text-[11px] font-semibold transition"
              >
                Stanford Revoked (CERT-2026-000456)
              </button>
              <button
                type="button"
                onClick={() => handlePillClick("TAMPER-TEST-999")}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[11px] font-semibold transition"
              >
                Tamper Anomaly Test
              </button>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-800 hover:border-brand-500 transition flex items-center gap-2 shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-brand-500" />
              <span>Full File Upload & QR Verification</span>
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 transition flex items-center gap-2 shadow-glow"
            >
              <span>Access Role Portals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Live Inline Verification HUD Panel (Appears smoothly when queried) */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center"
            >
              {errorMessage}
            </motion.div>
          )}

          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="mt-8 max-w-3xl mx-auto rounded-3xl p-6 sm:p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Cryptographic Verification Proof
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Query: {verificationResult.certificateId || searchQuery}
                    </p>
                  </div>
                </div>
                <StatusBadge status={verificationResult.status} size="lg" />
              </div>

              {/* Certificate Metadata Grid */}
              {verificationResult.certificate ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Student Recipient
                    </span>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {verificationResult.certificate.studentName}
                    </div>
                    <div className="text-xs text-brand-500 font-medium">
                      {verificationResult.certificate.title}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Issuing Institution
                    </span>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {verificationResult.certificate.institutionName} ({verificationResult.certificate.institutionCode})
                    </div>
                    <div className="text-xs text-slate-400">
                      Issued On: {new Date(verificationResult.certificate.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  {verificationResult.message}
                </div>
              )}

              {/* Risk Gauge & Explainable Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800">
                <div className="md:col-span-4 flex justify-center">
                  <RiskGauge fraudRisk={verificationResult.fraudRisk} />
                </div>
                <div className="md:col-span-8 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Explainable Cryptographic Integrity Factors
                  </div>
                  <ul className="space-y-1 text-xs">
                    {verificationResult.fraudRisk.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        {verificationResult.status === "VERIFIED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : verificationResult.status === "REVOKED" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Blockchain Proof Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="font-mono text-slate-400 truncate max-w-sm">
                  Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
                </div>
                {verificationResult.certificateId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/verify/${verificationResult.certificateId}`)}
                    className="font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1.5 transition"
                  >
                    <span>Full Audit Report & Download PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Metric Counters */}
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 text-center">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Byte-Level Tamper Proof</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 800ms</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">EVM Query Latency</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">Zero PII</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">GDPR / FERPA Compliant</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0 Gas</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Free Public Verification</div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED SEPARATE PORTALS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Multi-Role Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Dedicated Portals for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure, role-based workflows built for universities, graduates, and compliance officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Issuer Dashboard */}
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                University Issuer Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Issue single or batch academic degrees, calculate raw byte SHA-256 hashes, broadcast smart contract registrations, and manage authorized revocations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time byte hash generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Solidity event monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-click administrative revocation</span>
                </li>
              </ul>
            </div>
            <Link
              to="/issuer"
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition flex items-center justify-center gap-2"
            >
              <span>Launch Issuer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 2: Student Dashboard */}
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Student Credential Wallet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Graduates can view earned verified credentials, share instant QR codes with recruiters, and download cryptographically certified PDF proofs.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant LinkedIn & QR sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>On-chain transaction explorer links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Official degree PDF download</span>
                </li>
              </ul>
            </div>
            <Link
              to="/student"
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>Open Student Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 3: Admin Console */}
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Super Admin Governance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Approve university accreditation requests, configure smart contract parameters, inspect audit trails, and maintain global network compliance.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>University vetting and onboarding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Immutable audit logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>System health & contract telemetry</span>
                </li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition flex items-center justify-center gap-2"
            >
              <span>Access Governance Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. 21ST.DEV STYLE BENTO GRID CAPABILITIES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Next-Gen Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Cryptographic Absolute Truth
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Combining EVM state machines, SHA-256 byte hashing, and heuristic fraud detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Item 1: Large Feature */}
          <div className="md:col-span-8 rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-navy-900 dark:to-navy-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Raw-Byte Document Hashing Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              CertiChain reads documents as raw binary streams before calculating the SHA-256 digest. Modifying a single decimal digit in a student's GPA or alterating a student ID causes a catastrophic avalanche effect, invalidating the verification instantly.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
              <span className="text-slate-500">// SHA-256 Raw Byte Digest</span><br />
              <span className="text-brand-400">8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e</span>
            </div>
          </div>

          {/* Bento Item 2: Medium Feature */}
          <div className="md:col-span-4 rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-navy-900 dark:to-navy-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Explainable AI Risk Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Provides transparent 0-100 fraud risk analysis detailing exact reasons for discrepancies rather than a black-box verification outcome.
            </p>
          </div>

          {/* Bento Item 3: Medium Feature */}
          <div className="md:col-span-4 rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-navy-900 dark:to-navy-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Zero PII On-Chain Privacy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strictly compliant with GDPR and FERPA. Zero student names, grades, or personal identifiers are stored on the public blockchain.
            </p>
          </div>

          {/* Bento Item 4: Large Feature */}
          <div className="md:col-span-8 rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-navy-900 dark:to-navy-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Solidity 0.8.28 Smart Contract State Machine
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Deploys gas-optimized Solidity smart contracts enforcing university registrar authorization, immutable issuance timestamps, and irreversible on-chain revocation logs with reasons.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Authorized Issuers
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                17/17 Hardhat Unit Tests Passed
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sepolia & Mainnet Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR-STAGE LIFECYCLE */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Operational Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Four Steps to Tamper-Proof Trust
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            How CertiChain turns vulnerable paper and digital credentials into immutable cryptographic proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-extrabold text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Authorized registrar registers graduate academic metadata and attaches the official PDF document.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-extrabold text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hash</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              System derives a unique 64-character SHA-256 fingerprint from the raw bytes of the credential file.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-extrabold text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Commit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The hash is permanently stored in the EVM smart contract along with an embedded tamper-resistant QR code.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-lg">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Verify</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Recruiters and verifiers scan the QR or upload the file to authenticate with zero gas fees in under a second.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
