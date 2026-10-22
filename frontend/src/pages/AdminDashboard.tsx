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
    setActionLoading(appId);
    try {
      await api.post(`/institutions/admin/applications/${appId}/reject`, {
        notes: "Rejected during verification review",
      });
      fetchApplications();
    } catch (err) {
      alert("Failed to reject application: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "PENDING");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Governance & Audit Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Super Administrator Control Plane
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Logged in as {user?.email}
          </p>
        </div>

        {/* Blockchain Node Telemetry */}
        {blockchainHealth && (
          <div className="p-3 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className={`w-2 h-2 rounded-full ${blockchainHealth.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {blockchainHealth.network.toUpperCase()} Chain
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Block #{blockchainHealth.blockNumber} | {blockchainHealth.contractAddress.slice(0, 10)}...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-500" />
            Institution Issuer Accreditation Applications ({pendingApps.length} Pending)
          </h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Institution Name</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Official Email</th>
                  <th className="py-3.5 px-4">Applicant Representative</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <RotateCcw className="w-5 h-5 animate-spin mx-auto text-brand-500 mb-2" />
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No institution applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-950/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {app.institutionName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {app.institutionCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {app.officialEmail}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{app.applicantUser?.fullName}</div>
                        <div className="text-[10px] text-slate-400">{app.applicantUser?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : app.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-blue-500/10 text-blue-500 animate-pulse"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {app.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={actionLoading === app.id}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={actionLoading === app.id}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white disabled:opacity-50 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
