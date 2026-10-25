import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Search,
  Upload,
  QrCode,
  FileText,
  ShieldCheck,
  Cpu,
  Download,
  Share2,
  Check,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Layers,
  Calendar,
  Building,
  User,
  Hash,
  Fingerprint,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Eye, Lock, Key } from "lucide-react";
import { api } from "../services/api";
import { VerificationResult } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { RiskGauge } from "../components/RiskGauge";
import { ZKProofModal } from "../components/ZKProofModal";
import { ForensicScanner } from "../components/ForensicScanner";
import { recordVerificationHistory } from "../services/firebase";

export const VerifyPage: React.FC = () => {
  const { certificateId: routeCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"id" | "upload" | "qr" | "forensics">("id");
  const [certIdInput, setCertIdInput] = useState(routeCertId || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHashPreview, setFileHashPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZKModalOpen, setIsZKModalOpen] = useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Auto-verify if certificateId provided in URL
  useEffect(() => {
    if (routeCertId) {
      setCertIdInput(routeCertId);
      performVerificationById(routeCertId);
    }
  }, [routeCertId]);

  // Client-side SHA-256 computation preview for uploaded file
  useEffect(() => {
    if (!selectedFile) {
      setFileHashPreview(null);
      return;
    }

    const computeHash = async () => {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setFileHashPreview(hashHex);
      } catch (err) {
        console.error("Client SHA-256 calculation failed", err);
      }
    };

    computeHash();
  }, [selectedFile]);

  const triggerCelebration = (status: string) => {
    if (status === "VERIFIED") {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#00F2FE", "#38BDF8", "#10B981", "#6366F1"],
      });
    }
  };

  const performVerificationById = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await api.get<{ success: boolean; data: VerificationResult }>(
        `/verify/${encodeURIComponent(id.trim())}`
      );
      setResult(res.data);
      triggerCelebration(res.data.status);

      // Record to persistent Firestore & local history
      recordVerificationHistory({
        certificateId: res.data.certificateId || id.trim(),
        studentName: res.data.certificate?.studentName,
        institutionName: res.data.certificate?.institutionName,
        degree: res.data.certificate?.degree,
        documentSha256: res.data.integrity.registeredHash || res.data.integrity.submittedHash,
        status: res.data.status,
        riskScore: res.data.fraudRisk.riskScore,
        verifiedAt: res.data.verifiedAt || new Date().toISOString(),
        blockchainTxHash: res.data.blockchain?.txHash || undefined,
        tamperReasons: res.data.fraudRisk?.reasons,
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Verification request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certIdInput.trim()) return;
    navigate(`/verify/${certIdInput.trim()}`, { replace: true });
    performVerificationById(certIdInput.trim());
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a PDF certificate to verify.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (certIdInput.trim()) {
      formData.append("certificateId", certIdInput.trim());
    }

    try {
      const res = await api.postForm<{ success: boolean; data: VerificationResult }>(
        "/verify/upload",
        formData
      );
      setResult(res.data);
      triggerCelebration(res.data.status);

      // Record to persistent Firestore & local history
      recordVerificationHistory({
        certificateId: res.data.certificateId || certIdInput.trim() || "UPLOAD-DOC",
        studentName: res.data.certificate?.studentName,
        institutionName: res.data.certificate?.institutionName,
        degree: res.data.certificate?.degree,
        documentSha256: res.data.integrity.registeredHash || res.data.integrity.submittedHash,
        status: res.data.status,
        riskScore: res.data.fraudRisk.riskScore,
        verifiedAt: res.data.verifiedAt || new Date().toISOString(),
        blockchainTxHash: res.data.blockchain?.txHash || undefined,
        tamperReasons: res.data.fraudRisk?.reasons,
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Document upload verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!result?.certificateId) return;
    const url = `${window.location.origin}/verify/${result.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!result?.certificateId) return;
    try {
      const blob = await api.get<Blob>(`/certificates/${result.certificateId}/download`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download official certificate PDF.");
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EVM Cryptographic Audit Terminal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Verify Academic Credentials
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Validate authentic diplomas and transcripts directly against EVM smart contract state and raw binary SHA-256 byte digests with zero gas fees.
        </p>
      </header>

      {/* Verification Query Console Card */}
      <section aria-labelledby="verification-form-title" className="max-w-3xl mx-auto rounded-3xl bg-navy-900/90 border border-white/10 backdrop-blur-2xl shadow-card p-6 sm:p-8 space-y-6">
        <h2 id="verification-form-title" className="sr-only">Certificate Verification Method</h2>
        {/* Tab Selection Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1 rounded-2xl bg-navy-1000 border border-white/[0.08] gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "id"}
            onClick={() => {
              setActiveTab("id");
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
              activeTab === "id"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>ID / Hash</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "upload"}
            onClick={() => {
              setActiveTab("upload");
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
              activeTab === "upload"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "qr"}
            onClick={() => {
              setActiveTab("qr");
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
              activeTab === "qr"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Scanner</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "forensics"}
            onClick={() => {
              setActiveTab("forensics");
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
              activeTab === "forensics"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>AI Forensics</span>
          </button>
        </div>

        {/* Tab 1: Certificate ID / Hash Lookup */}
        {activeTab === "id" && (
          <form onSubmit={handleIdSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verify-cert-id-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2"
              >
                Certificate Identifier or SHA-256 Digest
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                <input
                  id="verify-cert-id-input"
                  type="text"
                  required
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="e.g. CERT-2026-000789 or 8c4d7a9f..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Instant Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCertIdInput("CERT-2026-000789");
                    performVerificationById("CERT-2026-000789");
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] transition"
                >
                  MIT Verified Degree
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCertIdInput("CERT-2026-000456");
                    performVerificationById("CERT-2026-000456");
                  }}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] transition"
                >
                  Revoked Certificate
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !certIdInput.trim()}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white text-navy-950 shadow-glow-cyan transition flex items-center gap-2 shrink-0 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Querying Blockchain...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify by Certificate ID</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: PDF File Upload */}
        {activeTab === "upload" && (
          <form onSubmit={handleFileUploadSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verify-file-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2"
              >
                Official PDF Document File
              </label>

              <div className="relative border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-2xl p-8 text-center bg-navy-1000/60 transition cursor-pointer">
                <input
                  id="verify-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white">
                    {selectedFile ? selectedFile.name : "Drag & drop or browse to choose PDF file"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Calculates raw binary byte digest before matching with EVM registry
                  </div>
                </div>
              </div>
            </div>

            {/* Client-Side Live SHA-256 Preview */}
            {fileHashPreview && (
              <div className="p-3.5 rounded-xl bg-navy-1000 border border-white/10 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>// CLIENT-SIDE SHA-256 DIGEST</span>
                  <span className="text-cyan-400 font-bold">READY</span>
                </div>
                <div className="text-cyan-300 break-all text-[11px]">
                  {fileHashPreview}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white text-navy-950 shadow-glow-cyan transition flex items-center gap-2 shrink-0 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Raw Bytes...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Verify PDF File Bytes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: QR Scanner */}
        {activeTab === "qr" && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-white">Camera QR Scanner Active</h3>
              <p className="text-xs text-slate-400">
                Point your mobile device camera at the tamper-resistant QR code embedded on any CertiChain academic credential.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCertIdInput("CERT-2026-000789");
                  setActiveTab("id");
                  performVerificationById("CERT-2026-000789");
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition shadow-glow-cyan min-h-[44px]"
              >
                Simulate QR Code Scan (Demo MIT Certificate)
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: AI Forensic Scanner */}
        {activeTab === "forensics" && (
          <div className="pt-2">
            <ForensicScanner />
          </div>
        )}
      </section>

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Comprehensive Cryptographic Proof Result Box */}
      {result && (
        <motion.section
          ref={resultRef}
          aria-labelledby="audit-report-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto rounded-3xl bg-navy-900/90 border border-cyan-400/30 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] backdrop-blur-2xl p-6 sm:p-10 space-y-8"
        >
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 id="audit-report-heading" className="text-xl font-extrabold text-white">
                  Cryptographic Verification Report
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Record Identifier: {result.certificateId || certIdInput}
                </p>
              </div>
            </div>

            <StatusBadge status={result.status} size="lg" />
          </div>

          {/* Certificate Credential Identity Card */}
          {result.certificate && (
            <div className="rounded-2xl bg-navy-950/80 border border-white/[0.08] p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    {result.certificate.institutionName} ({result.certificate.institutionCode})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Issued: {new Date(result.certificate.issueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Graduate Recipient
                  </div>
                  <div className="text-lg font-bold text-white">
                    {result.certificate.studentName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Certificate ID: {result.certificate.certificateId}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Degree & Major
                  </div>
                  <div className="text-lg font-bold text-cyan-300">
                    {result.certificate.title}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {result.certificate.degree} {result.certificate.department ? `· ${result.certificate.department}` : ""}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono pt-1 truncate">
                    Raw SHA-256: {result.certificate.documentSha256.slice(0, 18)}...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explainable Risk Gauge */}
          <RiskGauge fraudRisk={result.fraudRisk} />

          {/* Technical Blockchain Cryptographic Proof Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              EVM Consensus & Byte Matching Audit Trail
            </h3>
            <div className="rounded-2xl bg-navy-1000 border border-white/10 p-5 space-y-3.5 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">EVM Smart Contract:</span>
                <span className="text-cyan-400 text-[11px] break-all">
                  {result.blockchain.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
                </span>
              </div>

              {(result.certificate?.txHash || result.blockchain.txHash) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400 text-[11px]">On-Chain Transaction:</span>
                  <span className="text-slate-300 text-[11px] break-all">
                    {result.certificate?.txHash || result.blockchain.txHash}
                  </span>
                </div>
              )}

              {result.integrity.registeredHash && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                  <span className="text-slate-400 text-[11px]">Contract Registered Hash:</span>
                  <span className="text-slate-300 text-[11px] break-all">
                    {result.integrity.registeredHash}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-400 text-[11px]">Audit Timestamp:</span>
                <span className="text-slate-300 text-[11px]">
                  {result.verifiedAt ? new Date(result.verifiedAt).toUTCString() : new Date().toUTCString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 transition flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Audit Link Copied!" : "Share Audit Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsZKModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 transition flex items-center gap-2 min-h-[44px] cursor-pointer shadow-lg shadow-purple-500/10"
              >
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Generate Zero-Knowledge (ZK) Proof</span>
              </button>
            </div>

            {result.certificateId && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white text-navy-950 shadow-glow-cyan transition flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Certified PDF Proof</span>
              </button>
            )}
          </div>
        </motion.section>
      )}

      {/* Zero-Knowledge Proof Modal */}
      {result && result.certificate && (
        <ZKProofModal
          isOpen={isZKModalOpen}
          onClose={() => setIsZKModalOpen(false)}
          certificateId={result.certificateId || result.certificate.certificateId}
          studentName={result.certificate.studentName || "Graduate"}
          degree={result.certificate.degree || "Admitted Degree"}
        />
      )}
    </div>
  );
};
