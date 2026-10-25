import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import confetti from "canvas-confetti";
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
  Hash,
  Download,
  Building,
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResult } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { RiskGauge } from "../components/RiskGauge";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("CERT-2026-000789");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);

  // GSAP Cinematic Entrance Animation
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.9,
      })
        .from(
          subtitleRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          consoleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.4"
        )
        .from(
          metricsRef.current ? metricsRef.current.children : [],
          {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
          },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

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

      // Trigger celebratory confetti if certificate is genuine and verified!
      if (res.data.status === "VERIFIED") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00F2FE", "#38BDF8", "#10B981", "#6366F1"],
        });
      }

      // Smoothly scroll to proof result
      setTimeout(() => {
        proofRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
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
    <div className="relative overflow-x-hidden w-full max-w-full bg-mesh-dark">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-12 left-1/4 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-28 right-1/4 w-[420px] h-[420px] bg-indigo-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-80 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-sky-500/10 rounded-full blur-[140px]" />
      </div>

      {/* 1. HERO SECTION (Cinematic Center with AIDA Attention Focus) */}
      <section
        id="overview"
        ref={heroRef}
        className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-6xl mx-auto space-y-7">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-cyan-400 text-xs font-mono font-semibold backdrop-blur-md shadow-glow-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>EVM Cryptographic Protocol · Raw-Byte SHA-256</span>
          </div>

          {/* Heading (Ultra-Wide Container, 2-line max limit) */}
          <h1
            ref={titleRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto"
          >
            Decentralized Academic Credentials.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Zero Counterfeits. Cryptographic Truth.
            </span>
          </h1>

          {/* Subheading */}
          <p
            ref={subtitleRef}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Enterprise academic trust infrastructure connecting accredited universities, graduates, and global background check verifiers with sub-second on-chain verification.
          </p>

          {/* Real-Time Live Verification Console */}
          <div ref={consoleRef} className="pt-3 max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="relative p-2 rounded-2xl bg-navy-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-2 transition-all hover:border-cyan-400/40"
            >
              <div className="relative flex-1 flex flex-col justify-center">
                <label htmlFor="hero-cert-input" className="sr-only">
                  Certificate ID or SHA-256 Digest
                </label>
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 absolute left-3.5 text-cyan-400 shrink-0 pointer-events-none" />
                  <input
                    id="hero-cert-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. CERT-2026-000789)..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white text-navy-950 shadow-glow-cyan transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Querying Chain...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Verification Query</span>
                  </>
                )}
              </button>
            </form>

            {/* Instant Demo Presets */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px] font-semibold">Test Presets:</span>
              <button
                type="button"
                onClick={() => handlePillClick("CERT-2026-000789")}
                className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium text-[11px] transition flex items-center gap-1.5 min-h-[32px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Degree (MIT)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePillClick("CERT-2026-000456")}
                className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium text-[11px] transition flex items-center gap-1.5 min-h-[32px]"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Revoked Credential</span>
              </button>
              <button
                type="button"
                onClick={() => handlePillClick("TAMPER-TEST-999")}
                className="px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium text-[11px] transition flex items-center gap-1.5 min-h-[32px]"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tampered Document Test</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-navy-900 border border-white/10 hover:border-cyan-400/50 hover:bg-navy-800 transition flex items-center gap-2 min-h-[44px]"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Full PDF Upload & QR Scanner</span>
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 hover:from-cyan-300 hover:to-white transition shadow-glow-cyan flex items-center gap-2 min-h-[44px]"
            >
              <span>Explore Multi-Role Portals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Verification Proof Drawer / HUD */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-8 max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {verificationResult && (
            <motion.div
              ref={proofRef}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 max-w-3xl mx-auto rounded-3xl p-6 sm:p-8 bg-navy-900/90 border border-cyan-400/30 shadow-[0_0_50px_-15px_rgba(6,182,212,0.3)] backdrop-blur-2xl space-y-6"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Cryptographic On-Chain Verification Proof
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Target Query: {verificationResult.certificateId || searchQuery}
                    </p>
                  </div>
                </div>
                <StatusBadge status={verificationResult.status} size="lg" />
              </div>

              {/* Certificate Details Grid */}
              {verificationResult.certificate ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/[0.06] space-y-1">
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                      Student Recipient
                    </span>
                    <div className="text-base font-bold text-white">
                      {verificationResult.certificate.studentName}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {verificationResult.certificate.title}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/[0.06] space-y-1">
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                      Issuing Institution
                    </span>
                    <div className="text-base font-bold text-white">
                      {verificationResult.certificate.institutionName} ({verificationResult.certificate.institutionCode})
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Issued: {new Date(verificationResult.certificate.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                  {verificationResult.message}
                </div>
              )}

              {/* Live Risk Gauge Component */}
              <RiskGauge fraudRisk={verificationResult.fraudRisk} />

              {/* Blockchain Telemetry Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-white/[0.06]">
                <div className="font-mono text-slate-400 truncate max-w-sm flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
                </div>
                {verificationResult.certificateId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/verify/${verificationResult.certificateId}`)}
                    className="font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
                  >
                    <span>Full Audit Report & Download PDF Proof</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Metrics Row */}
        <div
          ref={metricsRef}
          className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto border-t border-white/[0.08] text-center"
        >
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
              100%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Byte-Level Tamper Proof</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              &lt; 650ms
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">EVM Verification Latency</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Zero PII
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">GDPR & FERPA Compliant</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              0 Gas
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Free Public Verification</div>
          </div>
        </div>
      </section>

      {/* 2. GAPLESS BENTO GRID (AIDA Interest Stage) */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Cryptographic Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered for Mathematical Absolute Truth
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminating forged degrees through raw-byte binary digesting, immutable EVM state transition logs, and heuristic anomaly detection.
          </p>
        </div>

        {/* Bento Grid: Mathematically gapless with grid-flow-dense */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grid-flow-dense">
          {/* Bento Item 1: Raw-Byte Digest (Span 8) */}
          <div className="md:col-span-8 rounded-3xl p-8 bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 hover:border-cyan-400/40 shadow-card transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">
                Raw-Byte Binary Document Digesting
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                CertiChain processes academic transcripts and degree certificates as raw binary byte streams before generating a 256-bit cryptographic digest. Changing a single pixel or a single decimal point in a GPA produces a catastrophic avalanche effect, instantaneously invalidating the hash.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-1000 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>// SHA-256 RAW BYTE STREAM</span>
                <span className="text-cyan-400">STATUS: MATCHED</span>
              </div>
              <div className="text-cyan-300 break-all">
                8c4d7a9f8b3c1e2d4a5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e
              </div>
            </div>
          </div>

          {/* Bento Item 2: Explainable Fraud Engine (Span 4) */}
          <div className="md:col-span-4 rounded-3xl p-8 bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 hover:border-amber-400/40 shadow-card transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Explainable Risk Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than an ambiguous binary outcome, our heuristic pipeline returns a calibrated 0-100 fraud score breaking down individual integrity markers, metadata timestamps, and registrar accreditation status.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Decoupled from EVM State</span>
            </div>
          </div>

          {/* Bento Item 3: Zero PII On-Chain (Span 4) */}
          <div className="md:col-span-4 rounded-3xl p-8 bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 hover:border-indigo-400/40 shadow-card transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Zero PII On Public Chain
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Guaranteed GDPR and FERPA compliance. No student legal names, email addresses, student IDs, or grades are stored in smart contract storage. Only the irreversible cryptographic hash resides on-chain.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>EU & US Compliance Ready</span>
            </div>
          </div>

          {/* Bento Item 4: Solidity 0.8.28 State Machine (Span 8) */}
          <div className="md:col-span-8 rounded-3xl p-8 bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 hover:border-sky-400/40 shadow-card transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">
                Solidity 0.8.28 Smart Contract State Machine
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Gas-optimized Solidity contracts enforce authorized registrar access control, immutable registration block timestamps, and permanent on-chain revocation logs with verifiable audit explanations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-300">
                Authorized Registrars
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                17/17 Hardhat Unit Tests Passed
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
                Sepolia & Mainnet Deployable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-ROLE ARCHITECTURE (AIDA Desire Stage) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Stakeholder Experience
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tailored Portals for Every Role
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Engineered with strict role-based access control, cryptographic key generation, and seamless credential management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Issuer */}
          <div className="rounded-3xl p-8 bg-navy-900/80 border border-white/10 hover:border-cyan-400/40 shadow-card transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">University Issuer Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accredited registrars issue individual or batch academic degrees, calculate raw byte SHA-256 hashes, broadcast on-chain commits, and execute administrative revocations.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time raw byte calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive QR certificate stamp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audit-logged on-chain revocation</span>
                </li>
              </ul>
            </div>
            <Link
              to="/issuer"
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-glow-cyan transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Launch Issuer Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Student */}
          <div className="rounded-3xl p-8 bg-navy-900/80 border border-white/10 hover:border-emerald-400/40 shadow-card transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Student Credential Wallet</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Graduates can view their earned tamper-proof credentials, generate scannable verification QR codes for recruiters, and download cryptographically certified official PDF copies.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant LinkedIn & QR sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Public block explorer proof links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-click official PDF export</span>
                </li>
              </ul>
            </div>
            <Link
              to="/student"
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-navy-800 hover:bg-navy-700 text-white border border-white/10 transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Open Student Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Admin */}
          <div className="rounded-3xl p-8 bg-navy-900/80 border border-white/10 hover:border-indigo-400/40 shadow-card transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Super Admin Governance</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review and approve university accreditation applications, monitor network transaction throughput, inspect audit records, and maintain system compliance.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Institution vetting & onboarding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>EVM node telemetry & block health</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Comprehensive activity audit log</span>
                </li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Access Governance Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FOUR-STAGE LIFECYCLE (AIDA Journey) */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Lifecycle Blueprint
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Four Steps to Tamper-Proof Trust
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            How CertiChain transforms vulnerable paper diplomas and easily falsified PDFs into immutable cryptographic proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl p-6 bg-navy-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-black text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-white">Register & Issue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized registrar fills academic achievement metadata and uploads the official PDF certificate file.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-navy-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-black text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-white">Raw Byte Hashing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The engine reads raw document bytes to extract a deterministic 64-character SHA-256 binary fingerprint.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-navy-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-black text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-white">Smart Contract Commit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The digest is permanently written to the EVM contract storage along with an embedded tamper-resistant QR code.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-navy-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-black text-lg">
              04
            </div>
            <h3 className="text-base font-bold text-white">Instant Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters scan the QR or upload the file to authenticate with zero gas fees and sub-second execution.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ACTION CALLOUT (AIDA Action Stage) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-cyan-400/30 text-center space-y-6 relative overflow-hidden shadow-[0_0_80px_-20px_rgba(6,182,212,0.25)]">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Secure Academic Credential Integrity?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join accredited higher education institutions eliminating diploma fraud through EVM smart contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center gap-2 min-h-[44px]"
            >
              <span>Apply for University Accreditation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/verify"
              className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 transition min-h-[44px] flex items-center"
            >
              <span>Instant Public Lookup</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
