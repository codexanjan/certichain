import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Upload,
  Download,
  Eye,
  RotateCcw,
  AlertTriangle,
  QrCode,
  Layers,
  User,
  Hash,
  X,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Certificate, CertificateStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { QRCodeSVG } from "qrcode.react";

export const IssuerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Issuance modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("Bachelor of Science in Computer Science");
  const [degree, setDegree] = useState("B.Sc. Computer Science");
  const [department, setDepartment] = useState("Department of Computer Science");
  const [cgpaOrGrade, setCgpaOrGrade] = useState("9.4 / 10.0");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [issuing, setIssuing] = useState(false);
  const [issuanceProgress, setIssuanceProgress] = useState<string | null>(null);
  const [issuanceError, setIssuanceError] = useState<string | null>(null);

  // Revoke modal state
  const [revokeCertId, setRevokeCertId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  // QR Modal state
  const [selectedQrCert, setSelectedQrCert] = useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: { certificates: Certificate[]; total: number };
      }>("/certificates", {
        params: { search: searchTerm, status: statusFilter },
      });
      setCertificates(res.data.certificates);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [searchTerm, statusFilter]);

  // Real-time socket updates listener
  useEffect(() => {
    if (!socket) return;

    socket.on("certificate:status", (data: { certificateId: string; status: CertificateStatus; txHash?: string }) => {
      setCertificates((prev) =>
        prev.map((c) =>
          c.certificateId === data.certificateId
            ? { ...c, status: data.status, txHash: data.txHash || c.txHash }
            : c
        )
      );
    });

    socket.on("blockchain:confirmed", (data: { certificateId: string; blockNumber: number; txHash: string }) => {
      setCertificates((prev) =>
        prev.map((c) =>
          c.certificateId === data.certificateId
            ? { ...c, status: "ACTIVE", blockNumber: data.blockNumber, txHash: data.txHash }
            : c
        )
      );
    });

    socket.on("certificate:revoked", (data: { certificateId: string; reason: string }) => {
      setCertificates((prev) =>
        prev.map((c) =>
          c.certificateId === data.certificateId
            ? { ...c, status: "REVOKED", revocationReason: data.reason }
            : c
        )
      );
    });

    return () => {
      socket.off("certificate:status");
      socket.off("blockchain:confirmed");
      socket.off("certificate:revoked");
    };
  }, [socket]);

  // Handle Certificate Issuance
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setIssuanceError("Please upload an official certificate PDF");
      return;
    }

    setIssuing(true);
    setIssuanceError(null);
    setIssuanceProgress("1/5: Uploading PDF and verifying magic bytes (%PDF-)...");

    try {
      const formData = new FormData();
      formData.append("studentName", studentName);
      formData.append("studentIdentifier", studentIdentifier);
      formData.append("studentEmail", studentEmail);
      formData.append("title", title);
      formData.append("degree", degree);
      formData.append("department", department);
      formData.append("cgpaOrGrade", cgpaOrGrade);
      formData.append("issueDate", issueDate);
      formData.append("file", pdfFile);

      setIssuanceProgress("2/5: Computing raw byte SHA-256 cryptographic digest...");
      setIssuanceProgress("3/5: Persisting certificate record in database...");
      setIssuanceProgress("4/5: Submitting registration transaction to smart contract...");

      const res = await api.postForm<{
        success: boolean;
        data: { certificate: Certificate; qrCodeDataUrl: string };
      }>("/certificates", formData);

      setIssuanceProgress("5/5: Certificate issued! Awaiting blockchain block confirmation...");

      setTimeout(() => {
        setIssueModalOpen(false);
        setIssuing(false);
        setIssuanceProgress(null);
        fetchCertificates();
      }, 1200);
    } catch (err) {
      setIssuanceError(err instanceof Error ? err.message : "Issuance failed");
      setIssuing(false);
    }
  };

  // Handle Revocation
  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertId || !revokeReason.trim()) return;

    setRevoking(true);
    try {
      await api.post(`/certificates/${revokeCertId}/revoke`, { reason: revokeReason });
      setRevokeCertId(null);
      setRevokeReason("");
      fetchCertificates();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Revocation failed");
    } finally {
      setRevoking(false);
    }
  };

  // Download PDF
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
      alert("Failed to download certificate: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const totalIssued = certificates.length;
  const activeCount = certificates.filter((c) => c.status === "ACTIVE").length;
  const pendingCount = certificates.filter((c) => c.status === "PENDING_BLOCKCHAIN").length;
  const revokedCount = certificates.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              Institution Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">Code: {user?.institutionCode || "INST"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {user?.institutionName || "Institution Registry"}
          </h1>
        </div>

        <button
          onClick={() => {
            setIssueModalOpen(true);
            setIssuanceError(null);
            setIssuanceProgress(null);
          }}
          className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-glow flex items-center justify-center gap-2 transition"
        >
          <FilePlus className="w-4 h-4" />
          Issue New Certificate
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Issued</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalIssued}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="text-xs text-emerald-500 font-semibold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active On-Chain
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1">{activeCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="text-xs text-blue-500 font-semibold uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Blocks
          </div>
          <div className="text-2xl font-black text-blue-500 mt-1">{pendingCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="text-xs text-amber-500 font-semibold uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Revoked
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">{revokedCount}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, or roll..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_BLOCKCHAIN">Pending</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Program / Degree</th>
                <th className="py-3.5 px-4">SHA-256 Digest</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    Loading certificate records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No certificate records found matching your filters.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {cert.certificateId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {cert.studentProfile?.fullName || "N/A"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cert.studentProfile?.studentIdentifier || "No Roll"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{cert.title}</div>
                      <div className="text-[10px] text-brand-600 dark:text-brand-400">{cert.degree}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={cert.documentSha256}>
                      {cert.documentSha256.slice(0, 16)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cert.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedQrCert(cert)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/verify/${cert.certificateId}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition inline-block"
                        title="Open Public Verification"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDownload(cert.certificateId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {cert.status !== "REVOKED" && (
                        <button
                          onClick={() => setRevokeCertId(cert.certificateId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Revoke Certificate"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ISSUE CERTIFICATE */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue Official Certificate</h3>
              </div>
              <button
                onClick={() => !issuing && setIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {issuanceError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{issuanceError}</span>
              </div>
            )}

            {issuanceProgress && (
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold space-y-1 animate-pulse">
                <div>{issuanceProgress}</div>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Anjan Shetty"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Roll / Student ID</label>
                  <input
                    type="text"
                    required
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g. MIT-2026-CS001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Certificate Award Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bachelor of Technology in AI & Data Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Degree Program</label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Official PDF */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Official Certificate PDF Document
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Raw file bytes are cryptographically hashed using SHA-256 and committed on-chain.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={issuing}
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing || !pdfFile}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition shadow-glow flex items-center gap-1.5"
                >
                  {issuing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                  {issuing ? "Issuing..." : "Issue & Register On Blockchain"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVOKE CERTIFICATE */}
      {revokeCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold">Confirm Certificate Revocation</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to revoke certificate <strong className="font-mono text-slate-900 dark:text-white">{revokeCertId}</strong>? This action updates the immutable blockchain smart contract status to REVOKED.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Reason for Revocation
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Administrative cancellation / Academic misconduct"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={revoking}
                  onClick={() => setRevokeCertId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking || !revokeReason.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
                >
                  {revoking ? "Revoking On-Chain..." : "Confirm Revocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW QR CODE */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{selectedQrCert.certificateId}</span>
              <button onClick={() => setSelectedQrCert(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-card">
              <QRCodeSVG
                value={`${window.location.origin}/verify/${selectedQrCert.certificateId}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scan with any mobile camera or QR reader to verify this certificate on-chain.
            </p>

            <button
              onClick={() => setSelectedQrCert(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
