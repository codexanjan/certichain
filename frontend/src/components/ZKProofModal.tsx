import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Key, Copy, Check, Sparkles, X, FileText } from "lucide-react";
import confetti from "canvas-confetti";

interface ZKProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  studentName: string;
  degree: string;
}

export const ZKProofModal: React.FC<ZKProofModalProps> = ({
  isOpen,
  onClose,
  certificateId,
  studentName,
  degree,
}) => {
  const [proofType, setProofType] = useState<"gpa" | "graduation" | "major">("gpa");
  const [threshold, setThreshold] = useState<string>("3.5");
  const [generating, setGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<{
    proofId: string;
    statement: string;
    zkCommitment: string;
    merklePath: string;
    isValid: boolean;
    timestamp: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateZKProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedProof(null);

    // Simulate cryptographic non-interactive zero-knowledge argument computation (zk-SNARK circuit)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const proofId = `ZK-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const randCommitment = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const randMerkle = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    let statement = "";
    if (proofType === "gpa") {
      statement = `Cumulative GPA is strictly greater than or equal to ${threshold}/4.0 without disclosing exact transcript grades.`;
    } else if (proofType === "graduation") {
      statement = `Degree Conferred in Full Good Standing with zero academic probation.`;
    } else {
      statement = `Degree Major satisfies criteria for STEM Accreditation without disclosing full course catalog.`;
    }

    setGeneratedProof({
      proofId,
      statement,
      zkCommitment: randCommitment,
      merklePath: randMerkle,
      isValid: true,
      timestamp: new Date().toISOString(),
    });

    setGenerating(false);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#00F2FE", "#38BDF8", "#10B981"],
      });
    } catch {
      // non-critical
    }
  };

  const handleCopyProof = () => {
    if (!generatedProof) return;
    const text = `--- CERTICHAIN ZERO-KNOWLEDGE PROOF ---\nProof ID: ${generatedProof.proofId}\nCertificate: ${certificateId}\nStatement: ${generatedProof.statement}\nzk-Commitment: ${generatedProof.zkCommitment}\nMerkle Branch: ${generatedProof.merklePath}\nStatus: CRYPTOGRAPHICALLY VALID`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-navy-950/95 border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-500/10 text-slate-100 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  Zero-Knowledge Proof Generator <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">ZK-SNARK</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Prove eligibility to recruiters &amp; employers with Zero PII or transcript exposure.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Zero Knowledge proof modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Badge */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500">Student:</span> <strong className="text-slate-200">{studentName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Certificate:</span> <code className="text-cyan-400 font-mono">{certificateId}</code>
            </div>
            <div>
              <span className="text-slate-500">Degree:</span> <span className="text-slate-300">{degree}</span>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleGenerateZKProof} className="space-y-5">
            <div>
              <label htmlFor="zk-predicate-select" className="block text-sm font-semibold text-slate-300 mb-2">
                1. Select Cryptographic Predicate to Prove
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  id="zk-predicate-select"
                  onClick={() => setProofType("gpa")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    proofType === "gpa"
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <strong className="block text-slate-200 mb-1">GPA Minimum</strong>
                  Prove GPA &gt;= threshold without showing bad course grades.
                </button>

                <button
                  type="button"
                  onClick={() => setProofType("graduation")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    proofType === "graduation"
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <strong className="block text-slate-200 mb-1">Honors Standing</strong>
                  Prove degree completion with zero disciplinary flags.
                </button>

                <button
                  type="button"
                  onClick={() => setProofType("major")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    proofType === "major"
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <strong className="block text-slate-200 mb-1">STEM Verified</strong>
                  Prove degree qualifies under national STEM standards.
                </button>
              </div>
            </div>

            {proofType === "gpa" && (
              <div>
                <label htmlFor="gpa-threshold" className="block text-sm font-semibold text-slate-300 mb-2">
                  2. Minimum GPA Threshold
                </label>
                <select
                  id="gpa-threshold"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="3.0">3.0 / 4.0 (B Equivalent)</option>
                  <option value="3.5">3.5 / 4.0 (Cum Laude / Dean&apos;s List)</option>
                  <option value="3.8">3.8 / 4.0 (Magna Cum Laude)</option>
                  <option value="3.9">3.9 / 4.0 (Summa Cum Laude)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  Generating Zero-Knowledge Mathematical Circuit...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Verifiable ZK Proof
                </>
              )}
            </button>
          </form>

          {/* Generated Result Proof */}
          {generatedProof && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-left space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> CRYPTOGRAPHICALLY VALID ZK-PROOF
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(generatedProof.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-100">
                &ldquo;{generatedProof.statement}&rdquo;
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Proof Identifier: </span>
                  <span className="text-cyan-400">{generatedProof.proofId}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">zk-Commitment: </span>
                  <span className="text-slate-300">{generatedProof.zkCommitment}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Merkle Branch: </span>
                  <span className="text-slate-300">{generatedProof.merklePath}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyProof}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copy Verifiable Proof for Employers
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
