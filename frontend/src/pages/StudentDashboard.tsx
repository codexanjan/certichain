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
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Certificate } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { QRCodeSVG } from "qrcode.react";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrCert, setSelectedQrCert] = useState<Certificate | null>(null);
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
    } catch (err) {
      alert("Failed to download official certificate");
    }
  };

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Student Credential Wallet
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Welcome, {user?.fullName || "Graduate"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Account: {user?.email}
          </p>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          My Verified Certificates ({certificates.length})
        </h2>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            Loading your credential wallet...
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Certificates Found Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Certificates issued to your student email by accredited academic institutions will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card p-6 flex flex-col justify-between space-y-6 hover:border-brand-500 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {cert.certificateId}
                    </span>
                    <StatusBadge status={cert.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                      {cert.degree}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cert.institution?.name || "Academic Institution"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Issued {new Date(cert.issueDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-navy-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 break-all truncate">
                    SHA256: {cert.documentSha256.slice(0, 20)}...
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    onClick={() => setSelectedQrCert(cert)}
                    className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-500 flex items-center justify-center gap-1 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                  </button>

                  <button
                    onClick={() => handleCopyLink(cert.certificateId)}
                    className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-brand-500 flex items-center justify-center gap-1 transition"
                  >
                    {copiedId === cert.certificateId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    Share
                  </button>

                  <button
                    onClick={() => handleDownload(cert.certificateId)}
                    className="py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-1 transition shadow-glow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {selectedQrCert.certificateId}
              </span>
              <button onClick={() => setSelectedQrCert(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-card">
              <QRCodeSVG
                value={`${window.location.origin}/verify/${selectedQrCert.certificateId}`}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share this QR code with recruiters and background checkers to verify your credential on-chain.
            </p>

            <button
              onClick={() => setSelectedQrCert(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
