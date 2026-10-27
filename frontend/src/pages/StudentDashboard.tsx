import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Check,
  Layers,
  Building,
  Calendar,
  RotateCcw,
  X,
  GraduationCap,
  Sparkles,
  Lock,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Certificate } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { QRCodeSVG } from "qrcode.react";
import { ZKProofModal } from "../components/ZKProofModal";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrCert, setSelectedQrCert] = useState<Certificate | null>(null);
  const [selectedZkCert, setSelectedZkCert] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: { certificates: Certificate[] };
      }>("/certificates");
      setCertificates(res.data.certificates);
    } catch (err) {
      console.error("Failed to fetch student certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  const handleDownload = async (certId: string) => {
    try {
      const blob = await api.get<Blob>(`/certificates/${certId}/download`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download official certificate PDF.");
    }
  };

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Credential Wallet</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome, {user?.fullName || "Graduate"}
          </h1>
          <p className="text-xs text-slate-300">
            Account: <span className="font-mono text-cyan-300 font-bold">{user?.email}</span>
          </p>
        </div>

        <Link
          to="/verify"
          className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center gap-2 min-h-[44px]"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verify an External Certificate</span>
        </Link>
      </header>

      {/* Certificates Section */}
      <section aria-labelledby="wallet-credentials-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="wallet-credentials-heading" className="text-lg font-bold text-white flex items-center gap-2">
            <span>Verified Credentials in Wallet</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-cyan-400">
              {certificates.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            Loading your verified credential wallet...
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-3xl bg-navy-900/80 border border-white/10 p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Credentials Found Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once your accredited university issues your degree on CertiChain, it will automatically appear in your wallet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <article
                key={cert.certificateId}
                className="rounded-3xl bg-navy-900/90 border border-white/10 hover:border-cyan-400/40 p-6 sm:p-8 space-y-6 shadow-card backdrop-blur-2xl transition group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {cert.certificateId}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                      {cert.title}
                    </h3>
                  </div>
                  <StatusBadge status={cert.status} size="sm" />
                </div>

                {/* Details */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      {cert.institution?.name || "Accredited University"} ({cert.institution?.code || cert.institutionId})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Conferred: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>

                  {cert.cgpaOrGrade && (
                    <div className="flex items-center gap-2 text-emerald-400 font-mono">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span>Grade: {cert.cgpaOrGrade}</span>
                    </div>
                  )}

                  {cert.txHash && (
                    <div className="p-2.5 rounded-xl bg-navy-1000 border border-white/[0.06] font-mono text-[11px] text-slate-400 truncate">
                      <span className="text-slate-500">TX: </span>
                      {cert.txHash}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQrCert(cert)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 border border-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(cert.certificateId)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      {copiedId === cert.certificateId ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>Share Link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedZkCert(cert)}
                      className="p-2.5 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 border border-purple-500/40 transition min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm shadow-purple-500/20"
                    >
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span>ZK Privacy Proof</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(cert.certificateId)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <Link
                      to={`/verify/${cert.certificateId}`}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* QR Modal */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl bg-navy-900 border border-white/10 shadow-2xl max-w-sm w-full p-6 text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {selectedQrCert.certificateId}
              </span>
              <button
                type="button"
                onClick={() => setSelectedQrCert(null)}
                aria-label="Close QR Modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-glow">
              <QRCodeSVG
                value={`${window.location.origin}/verify/${selectedQrCert.certificateId}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white">
                {selectedQrCert.studentProfile?.fullName || "Graduate"}
              </div>
              <div className="text-xs text-slate-400">
                {selectedQrCert.title}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/verify/${selectedQrCert.certificateId}`}
                target="_blank"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ZK Proof Modal */}
      {selectedZkCert && (
        <ZKProofModal
          isOpen={!!selectedZkCert}
          onClose={() => setSelectedZkCert(null)}
          certificateId={selectedZkCert.certificateId}
          studentName={selectedZkCert.studentProfile?.fullName || user?.fullName || "Graduate"}
          degree={selectedZkCert.title || selectedZkCert.degree || "Bachelor of Science"}
        />
      )}
    </div>
  );
};
