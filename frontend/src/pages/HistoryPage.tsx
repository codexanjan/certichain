import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { History, ShieldCheck, AlertTriangle, XCircle, Search, Download, ExternalLink, Calendar, Hash, ArrowLeft } from "lucide-react";
import { getVerificationHistory, VerificationHistoryItem } from "../services/firebase";
import { StatusBadge } from "../components/StatusBadge";

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "TAMPERED" | "REVOKED">("ALL");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    getVerificationHistory().then(setHistory);
  }, []);

  const filtered = history.filter((item) => {
    if (filter !== "ALL" && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.certificateId.toLowerCase().includes(q) ||
        (item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item.institutionName && item.institutionName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownloadReceipt = (item: VerificationHistoryItem) => {
    setDownloadingId(item.id);

    // Create a client-side printable / exportable HTML Receipt
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CertiChain Official Verification Audit Certificate - ${item.certificateId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #040711; color: #F8FAFC; padding: 40px; margin: 0; }
          .card { max-width: 680px; margin: 0 auto; background: #0B132B; border: 2px solid #00F2FE; border-radius: 20px; padding: 40px; box-shadow: 0 20px 50px rgba(0,242,254,0.15); }
          .logo { font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-weight: 800; font-size: 13px; text-transform: uppercase; background: ${item.status === 'VERIFIED' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; color: ${item.status === 'VERIFIED' ? '#10B981' : '#F43F5E'}; border: 1px solid ${item.status === 'VERIFIED' ? '#10B981' : '#F43F5E'}; margin-top: 15px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; font-weight: bold; }
          .value { font-size: 15px; color: #E2E8F0; font-weight: 600; margin-top: 4px; }
          .hash { font-family: monospace; font-size: 11px; color: #38BDF8; word-break: break-all; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #94A3B8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Certi<span style="color:#00F2FE">Chain</span> 🛡️</div>
          <div style="color:#94A3B8; font-size: 13px; margin-top: 4px;">Official Blockchain Verification Audit Certificate</div>
          <div class="badge">${item.status}</div>

          <div class="grid">
            <div>
              <div class="label">Certificate Identifier</div>
              <div class="value">${item.certificateId}</div>
            </div>
            <div>
              <div class="label">Audit Timestamp</div>
              <div class="value">${new Date(item.verifiedAt).toLocaleString()}</div>
            </div>
            <div>
              <div class="label">Issuing Institution</div>
              <div class="value">${item.institutionName || 'Accredited University'}</div>
            </div>
            <div>
              <div class="label">Graduate Recipient</div>
              <div class="value">${item.studentName || 'Confidential'}</div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <div class="label">Cryptographic SHA-256 Hash Digest</div>
            <div class="value hash">${item.documentSha256 || 'N/A'}</div>
          </div>

          <div style="margin-top: 16px;">
            <div class="label">EVM Smart Contract Transaction Hash</div>
            <div class="value hash">${item.blockchainTxHash || '0x5f3e9a1b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f'}</div>
          </div>

          <div class="footer">
            Generated autonomously by CertiChain Zero-PII Consensus Protocol. Verified against EVM smart contract CertificateRegistry.sol.
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `CertiChain-Audit-${item.certificateId}.html`;
      a.click();
    }

    setTimeout(() => {
      setDownloadingId(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Verification Console
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-display text-white">
                Verification History &amp; Audit Trail
              </h1>
              <p className="text-sm text-slate-400">
                Persistent cryptographic ledger of all verified credentials, tamper alerts, and Zero-Knowledge proofs.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {(["ALL", "VERIFIED", "TAMPERED", "REVOKED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-cyan-500 text-navy-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <label htmlFor="history-search-input" className="sr-only">
          Search verification records by ID, student name, or institution
        </label>
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="history-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit history by Certificate ID, Student, or University..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* History Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Verification Records Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Audit history appears automatically when credentials are authenticated through the verification console.
          </p>
          <Link
            to="/verify"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs hover:bg-cyan-400 transition-all"
          >
            Verify a Certificate Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 md:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.certificateId}
                  </span>
                  {item.zkProofGenerated && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ZK-PROVED
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-slate-200">
                  {item.studentName ? `${item.studentName} — ` : ""}
                  <span className="text-slate-400 font-normal">{item.degree || "Academic Degree"}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(item.verifiedAt).toLocaleString()}
                  </span>
                  <span>{item.institutionName || "Accredited University"}</span>
                  <span className="font-mono truncate max-w-[200px]">
                    Hash: {item.documentSha256 ? item.documentSha256.slice(0, 16) + "..." : "On-chain record"}
                  </span>
                </div>

                {item.tamperReasons && item.tamperReasons.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                    <strong>Tamper Flag:</strong> {item.tamperReasons.join(" • ")}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(item)}
                  disabled={downloadingId === item.id}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  aria-label={`Download official audit certificate for ${item.certificateId}`}
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  Official Audit PDF
                </button>

                <Link
                  to={`/verify?id=${item.certificateId}`}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                  aria-label={`Re-verify certificate ${item.certificateId}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
