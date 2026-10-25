import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ExternalLink,
  Cpu,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { StatusBadge } from "../components/StatusBadge";

interface Application {
  id: string;
  institutionName: string;
  institutionCode: string;
  officialEmail: string;
  websiteUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  applicantUser: {
    fullName: string;
    email: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Blockchain health state
  const [blockchainHealth, setBlockchainHealth] = useState<{
    connected: boolean;
    network: string;
    blockNumber: number;
    contractAddress: string;
  } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: { applications: Application[] };
      }>("/institutions/admin/applications");
      setApplications(res.data.applications);

      const healthRes = await api.get<{
        success: boolean;
        data: { connected: boolean; network: string; blockNumber: number; contractAddress: string };
      }>("/blockchain/health");
      setBlockchainHealth(healthRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on("dashboard:stats-updated", () => {
      fetchApplications();
    });
    return () => {
      socket.off("dashboard:stats-updated");
    };
  }, [socket]);

  const handleApprove = async (appId: string) => {
    setActionLoading(appId);
    try {
      await api.post(`/institutions/admin/applications/${appId}/approve`, {
        notes: "Approved by Super Admin",
      });
      fetchApplications();
    } catch (err) {
      alert("Failed to approve application: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    const reason = prompt("Enter rejection reason for institution accreditation:");
    if (!reason) return;

    setActionLoading(appId);
    try {
      await api.post(`/institutions/admin/applications/${appId}/reject`, {
        notes: reason,
      });
      fetchApplications();
    } catch (err) {
      alert("Failed to reject application: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "PENDING").length;
  const approvedApps = applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Root Super Administrator Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Network Governance & Accreditation
          </h1>
          <p className="text-xs text-slate-300">
            Administrator: <span className="font-mono text-cyan-300 font-bold">{user?.email}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-navy-900 border border-white/10 transition flex items-center gap-2 min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Refresh Telemetry</span>
        </button>
      </header>

      {/* Node Telemetry & Status Cards */}
      <section aria-label="EVM Blockchain Telemetry" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-white/10 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Node Status</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
          </div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>{blockchainHealth?.network || "EVM Hardhat Node"}</span>
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            State: Connected & Synchronized
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-navy-900/80 border border-white/10 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Latest Block Height</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">
            #{blockchainHealth?.blockNumber ?? 42}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Consensus: Local PoA Hardhat
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-navy-900/80 border border-white/10 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Smart Contract Address</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-mono text-cyan-300 break-all bg-navy-1000 p-2 rounded-xl border border-white/10">
            {blockchainHealth?.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Solidity 0.8.28 Verified
          </div>
        </div>
      </section>

      {/* University Accreditation Applications Table */}
      <section aria-labelledby="applications-list-heading" className="rounded-3xl bg-navy-900/90 border border-white/10 shadow-card backdrop-blur-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <h2 id="applications-list-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <span>University Accreditation Applications</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                {pendingApps} Pending Review
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Review credential issuer applications submitted by university administrative officers.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-1000 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">University</th>
                <th className="py-3.5 px-4">Accreditation Code</th>
                <th className="py-3.5 px-4">Applicant Officer</th>
                <th className="py-3.5 px-4">Official Website</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    Loading accreditation queue...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No accreditation applications in queue.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{app.institutionName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.officialEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {app.institutionCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{app.applicantUser?.fullName || "Registrar"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.applicantUser?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={app.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                          app.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : app.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {app.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === app.id}
                            onClick={() => handleApprove(app.id)}
                            className="px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-navy-950 transition flex items-center gap-1 shadow-glow-emerald disabled:opacity-50 min-h-[44px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Accreditation</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === app.id}
                            onClick={() => handleReject(app.id)}
                            className="px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition flex items-center gap-1 disabled:opacity-50 min-h-[44px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">Audit Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
