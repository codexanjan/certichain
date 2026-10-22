import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { api } from "../services/api";
import { VerificationResult } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { RiskGauge } from "../components/RiskGauge";

export const VerifyPage: React.FC = () => {
  const { certificateId: routeCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"id" | "upload" | "qr">("id");
  const [certIdInput, setCertIdInput] = useState(routeCertId || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // If URL contains certificateId, run verification immediately
  useEffect(() => {
    if (routeCertId) {
      setCertIdInput(routeCertId);
      performVerificationById(routeCertId);
    }
  }, [routeCertId]);

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
      setErrorMsg("Please select a PDF file to verify.");
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
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Document upload verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (result?.certificateId) {
      const url = `${window.location.origin}/verify/${result.certificateId}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Independent Blockchain Integrity Inspection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Verify Academic Certificate
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Authenticate credentials directly against immutable EVM smart contract records and detect byte-level PDF alterations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab("id");
              setErrorMsg(null);
            }}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === "id"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Certificate ID Lookup
          </button>
          <button
            onClick={() => {
              setActiveTab("upload");
              setErrorMsg(null);
            }}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === "upload"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF Document
          </button>
        </div>
      </div>

      {/* Verification Inputs Form */}
      <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card">
        {activeTab === "id" && (
          <form onSubmit={handleIdSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Certificate Identifier
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="e.g. CERT-2026-000123"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !certIdInput.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition shadow-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Inspecting Blockchain Records...
                </>
              ) : (
                "Verify Authenticity"
              )}
            </button>
          </form>
        )}

        {activeTab === "upload" && (
          <form onSubmit={handleFileUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Upload Certificate PDF
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 transition cursor-pointer bg-slate-50 dark:bg-navy-950">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload-input"
                />
                <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedFile ? (
                      <span className="font-bold text-brand-600 dark:text-brand-400">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      <>
                        <span className="font-bold text-brand-500">Click to upload</span> or drag and drop official PDF
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">PDF up to 10MB. Raw bytes will be hashed client & server-side.</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Optional: Certificate ID (if cross-referencing specific ID)
              </label>
              <input
                type="text"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                placeholder="CERT-2026-XXXX (Optional)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition shadow-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Computing Byte SHA-256 & Matching Chain...
                </>
              ) : (
                "Verify File Integrity"
              )}
            </button>
          </form>
        )}

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Status Banner */}
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <span className="text-xs font-mono text-slate-400 block">Certificate Identifier</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {result.certificateId || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={result.status} size="lg" />
                {result.certificateId && (
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition"
                    title="Share Verification Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Explanation Message */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white block mb-1">Audit Finding:</strong>
              {result.message}
            </div>

            {/* Certificate Details If Record Exists */}
            {result.certificate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-brand-500" /> Recipient Name
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">
                    {result.certificate.studentName}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-brand-500" /> Issuing Institution
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">
                    {result.certificate.institutionName} ({result.certificate.institutionCode})
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1 md:col-span-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-brand-500" /> Qualification & Degree
                  </span>
                  <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 block">
                    {result.certificate.title}
                  </span>
                  {result.certificate.department && (
                    <span className="text-xs text-slate-500 block">Department: {result.certificate.department}</span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" /> Issue Date
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    {new Date(result.certificate.issueDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Hash className="w-3.5 h-3.5 text-brand-500" /> Document Integrity
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {result.integrity.hashMatched ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> SHA-256 Matched
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Hash Mismatch (Altered)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Cryptographic Hashes & Blockchain Proof */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-500" />
                Immutable Blockchain Verification Telemetry
              </h4>

              <div className="space-y-2 text-xs font-mono">
                {result.integrity.registeredHash && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Registered On-Chain SHA-256 Digest:
                    </span>
                    <span className="text-brand-600 dark:text-brand-400 break-all select-all font-bold">
                      {result.integrity.registeredHash}
                    </span>
                  </div>
                )}

                {result.integrity.submittedHash && result.integrity.submittedHash !== result.integrity.registeredHash && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] text-rose-500 uppercase font-semibold block">
                      Submitted File SHA-256 Digest:
                    </span>
                    <span className="text-rose-500 break-all select-all font-bold">
                      {result.integrity.submittedHash}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Network</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {result.blockchain.network.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Transaction Hash</span>
                    <span className="text-slate-800 dark:text-slate-200 break-all select-all font-bold">
                      {result.blockchain.txHash || "Pending or None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Fraud Risk Panel */}
          {result.fraudRisk && <RiskGauge fraudRisk={result.fraudRisk} />}
        </div>
      )}
    </div>
  );
};
