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
  Building,
  GraduationCap,
  Sparkles,
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
            ? { ...c, status: "ACTIVE", txHash: data.txHash, blockNumber: data.blockNumber }
            : c
        )
      );
    });

    return () => {
      socket.off("certificate:status");
      socket.off("blockchain:confirmed");
    };
  }, [socket]);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setIssuanceError("Please upload an official PDF credential file.");
      return;
    }

    setIssuing(true);
    setIssuanceError(null);
    setIssuanceProgress("Calculating raw-byte SHA-256 digest...");

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

    try {
      setTimeout(() => setIssuanceProgress("Broadcasting EVM smart contract transaction..."), 600);
      await api.postForm("/certificates", formData);
      setIssueModalOpen(false);
      resetIssueForm();
      fetchCertificates();
    } catch (err) {
      setIssuanceError(err instanceof Error ? err.message : "Issuance failed");
    } finally {
      setIssuing(false);
      setIssuanceProgress(null);
    }
  };

  const resetIssueForm = () => {
    setStudentName("");
    setStudentIdentifier("");
    setStudentEmail("");
    setTitle("Bachelor of Science in Computer Science");
    setDegree("B.Sc. Computer Science");
    setDepartment("Department of Computer Science");
    setCgpaOrGrade("9.4 / 10.0");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setPdfFile(null);
    setIssuanceError(null);
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertId) return;

    setRevoking(true);
    try {
      await api.post(`/certificates/${revokeCertId}/revoke`, {
        reason: revokeReason || "Administrative Revocation by University Registrar",
      });
      setRevokeCertId(null);
      setRevokeReason("");
      fetchCertificates();
    } catch (err) {
      alert("Revocation failed: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setRevoking(false);
    }
  };

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

  // Metrics
  const totalCerts = certificates.length;
  const activeCerts = certificates.filter((c) => c.status === "ACTIVE").length;
  const pendingCerts = certificates.filter(
    (c) => c.status === "PENDING_BLOCKCHAIN" || c.status === "DRAFT"
  ).length;
  const revokedCerts = certificates.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Banner & University Details */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
            <Building className="w-3.5 h-3.5" />
            <span>Accredited Registrar Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            University Credential Hub
          </h1>
          <p className="text-xs text-slate-300">
            Logged in as: <span className="font-mono text-cyan-300 font-bold">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center gap-2 min-h-[44px]"
          >
            <FilePlus className="w-4 h-4" />
            <span>Issue Academic Degree</span>
          </button>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section aria-label="Credential Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-white/10 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase">Total Issued</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalCerts}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Academic Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-emerald-500/20 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">On-Chain Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{activeCerts}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Verified in State Machine</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-sky-500/20 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-sky-400 font-semibold uppercase">Pending Commit</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-400 mt-2">{pendingCerts}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Awaiting Block Confirmation</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-rose-500/20 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-400 font-semibold uppercase">Revoked</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">{revokedCerts}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Permanently Deactivated</div>
        </div>
      </section>

      {/* Main Ledger Table Card */}
      <section aria-labelledby="issued-records-heading" className="rounded-3xl bg-navy-900/90 border border-white/10 shadow-card backdrop-blur-2xl p-6 sm:p-8 space-y-6">
        {/* Search and Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 id="issued-records-heading" className="text-lg font-bold text-white">
              Institutional Credential Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Manage cryptographic certificates and view live EVM block confirmations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <label htmlFor="ledger-search-input" className="sr-only">Search records</label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="ledger-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or ID..."
                className="pl-9 pr-3.5 py-2 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="status-filter-select" className="sr-only">Filter by status</label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 min-h-[44px]"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active (Verified)</option>
                <option value="PENDING">Pending Block</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-1000 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4">Graduate</th>
                <th className="py-3.5 px-4">Degree & Major</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Issued On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    Synchronizing ledger with EVM state...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No academic certificates matched your search criteria.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => {
                  const studentName = cert.studentProfile?.fullName || "Graduate";
                  const studentId = cert.studentProfile?.studentIdentifier || cert.certificateId;
                  return (
                    <tr key={cert.certificateId} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {cert.certificateId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{studentId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{cert.title}</div>
                        <div className="text-[11px] text-slate-400">{cert.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedQrCert(cert)}
                            title="Show Scannable QR Code"
                            aria-label={`View QR code for ${studentName}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(cert.certificateId)}
                            title="Download Certified PDF"
                            aria-label={`Download PDF for ${studentName}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/verify/${cert.certificateId}`}
                            title="View Public Audit Proof"
                            aria-label={`View audit proof for ${studentName}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {cert.status !== "REVOKED" && (
                            <button
                              type="button"
                              onClick={() => setRevokeCertId(cert.certificateId)}
                              title="Revoke Certificate"
                              aria-label={`Revoke certificate for ${studentName}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Issue Certificate Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl bg-navy-900 border border-white/10 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Issue New Academic Credential
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Direct on-chain EVM registration & raw byte digestion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIssueModalOpen(false)}
                aria-label="Close modal"
                className="p-2 rounded-lg text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {issuanceError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{issuanceError}</span>
              </div>
            )}

            {issuanceProgress && (
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-3">
                <RotateCcw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                <span>{issuanceProgress}</span>
              </div>
            )}

            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-student-name"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Graduate Full Name
                  </label>
                  <input
                    id="modal-student-name"
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-student-id"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Student ID Number
                  </label>
                  <input
                    id="modal-student-id"
                    type="text"
                    required
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g. MIT-2026-904"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-student-email"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Graduate Email
                  </label>
                  <input
                    id="modal-student-email"
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="maya@mit.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-issue-date"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Conferral Date
                  </label>
                  <input
                    id="modal-issue-date"
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-degree-title"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Credential Title
                </label>
                <input
                  id="modal-degree-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Master of Science in Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-department"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Department
                  </label>
                  <input
                    id="modal-department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-cgpa"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Final CGPA / Grade
                  </label>
                  <input
                    id="modal-cgpa"
                    type="text"
                    value={cgpaOrGrade}
                    onChange={(e) => setCgpaOrGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-pdf-file"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Official PDF Certificate Document
                </label>
                <input
                  id="modal-pdf-file"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-1000 border border-white/10 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-navy-950 hover:file:bg-cyan-400 cursor-pointer min-h-[44px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {issuing ? "Broadcasting to Blockchain..." : "Issue & Commit to Chain"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokeCertId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl bg-navy-900 border border-rose-500/30 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Revoke Certificate
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Permanent immutable action on EVM contract
                </p>
              </div>
            </div>

            <form onSubmit={handleRevoke} className="space-y-4">
              <div>
                <label
                  htmlFor="revoke-reason-input"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Official Revocation Reason
                </label>
                <textarea
                  id="revoke-reason-input"
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Academic honor code violation, degree issued in error..."
                  className="w-full p-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRevokeCertId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-glow-rose transition flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {revoking ? "Revoking on EVM Chain..." : "Confirm Permanent Revocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
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
                <span>Open Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
