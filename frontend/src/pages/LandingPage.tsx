import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Cpu,
  QrCode,
  Lock,
  ArrowRight,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Eye,
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResult } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { RiskGauge } from "../components/RiskGauge";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickCertId, setQuickCertId] = useState("CERT-2026-000123");
  const [loading, setLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCertId.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setQuickResult(null);

    try {
      const res = await api.get<{ success: boolean; data: VerificationResult }>(
        `/verify/${encodeURIComponent(quickCertId.trim())}`
      );
      setQuickResult(res.data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Verification request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-brand-400/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Academic Credential Protocol</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Verify. Trust. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-400">
                  Authenticate.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Verify academic credentials with blockchain-backed integrity records, secure certificate SHA-256 byte hashing, and instant QR-based verification. Eliminates manual registrar delays and catches document tampering instantly.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/verify"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-glow flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" />
                  Verify a Certificate
                </Link>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">100%</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Byte-Level Tamper Proof</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">&lt; 800ms</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Verification Latency</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">Zero PII</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Public Chain Privacy</div>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Certificate Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Demo Academic Credential</h3>
                      <p className="text-[10px] text-slate-400">Cryptographically Registered</p>
                    </div>
                  </div>
                  <StatusBadge status="VERIFIED" size="sm" />
                </div>

                {/* Certificate Details Snapshot */}
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 dark:bg-navy-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Student Recipient</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Anjan Shetty</div>
                    <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      B.Tech in Artificial Intelligence & Data Science
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 dark:bg-navy-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Certificate ID</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">CERT-2026-000123</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-navy-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Issuing Authority</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">MIT (Registrar)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">
                      SHA-256 Document Hash (Raw Bytes)
                    </span>
                    <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 break-all select-all block mt-0.5">
                      8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e
                    </span>
                  </div>
                </div>

                <Link
                  to="/verify/CERT-2026-000123"
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Verification Report & Smart Contract Proof
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE VERIFICATION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-navy-950 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              Live Interactive Test
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Test Real-Time Verification Now
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter any Certificate ID to query PostgreSQL and the local Hardhat smart contract simultaneously.
            </p>
          </div>

          <form onSubmit={handleQuickVerify} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={quickCertId}
                onChange={(e) => setQuickCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-000123)"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shrink-0 shadow-glow"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Record"
              )}
            </button>
          </form>

          {/* Quick Result Panel */}
          {errorMsg && (
            <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {quickResult && (
            <div className="mt-8 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-mono">ID: {quickResult.certificateId}</span>
                <StatusBadge status={quickResult.status} size="md" />
              </div>

              {quickResult.certificate ? (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Student</span>
                    <span className="font-bold text-white">{quickResult.certificate.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Institution</span>
                    <span className="font-bold text-white">{quickResult.certificate.institutionName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Awarded Degree</span>
                    <span className="font-bold text-brand-400">{quickResult.certificate.title}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">{quickResult.message}</p>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Tx: {quickResult.blockchain.txHash ? `${quickResult.blockchain.txHash.slice(0, 18)}...` : "None"}
                </span>
                <button
                  onClick={() => navigate(`/verify/${quickResult.certificateId}`)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  Full Inspection Report &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. HOW IT WORKS: 4-STAGE LIFECYCLE */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Cryptographic Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Four Steps to Tamper-Proof Trust
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            How CertiChain transforms vulnerable paper and digital documents into independently verifiable on-chain proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 hover:border-brand-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-extrabold text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Authorized academic registrar uploads the official certificate PDF and registers student credentials through server-side RBAC.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 hover:border-brand-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-extrabold text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hash</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              CertiChain calculates the exact SHA-256 hash from raw document bytes. A single altered character completely transforms this 64-char fingerprint.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 hover:border-brand-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-extrabold text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Register</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The cryptographic proof is permanently committed to the EVM smart contract. A unique QR code linking to verification is automatically generated.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4 hover:border-brand-500 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-extrabold text-lg">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Verify</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Employers scan the QR code or drag & drop the PDF. The platform matches hashes and on-chain records in milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KEY PLATFORM FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Enterprise Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Academic Integrity
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every feature is engineered for reliability, security compliance, and viva demonstration excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Contract Registry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Immutable Solidity contract (Solidity 0.8.28) tracking document hashes, issuer authorization, and revocation timestamps without storing raw documents.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Raw-Byte Hashing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SHA-256 digests computed directly from raw binary streams, avoiding rendering differences and guaranteeing 100% mathematical integrity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Explainable Fraud Risk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Transparent 0-100 risk scoring evaluating issuer status, date anomalies, and structural indicators—decoupled from the binary blockchain truth.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant QR Scanning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mobile-optimized QR verification with in-browser camera scanning, enabling recruiters to authenticate physical or printed credentials on the spot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Authorized Revocation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Institutions can formally revoke compromised or cancelled degrees on-chain with reason logging, instantly turning verification results to REVOKED.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live WebSockets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Socket.IO push channels streaming transaction submission, block confirmations, and verification alerts in real time without browser refreshes.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECURITY SECTION */}
      <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Security Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Why CertiChain is Privacy-First & Attack-Resistant
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-500" />
                Zero PII on Public Blockchain
              </h4>
              <p className="leading-relaxed">
                Public blockchains are immutable and transparent. Storing student names or grades violates GDPR and FERPA regulations. CertiChain writes only a 32-byte cryptographic SHA-256 hash and derived key on-chain, preserving student confidentiality.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-500" />
                Protected Document Storage
              </h4>
              <p className="leading-relaxed">
                Certificate PDFs are stored in protected local or private object storage accessible only through authenticated, server-side authorized endpoints. No raw PDF documents are ever placed in open public folders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
