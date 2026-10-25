import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, HelpCircle } from "lucide-react";
import { VerificationOutcome, CertificateStatus } from "../types";

interface StatusBadgeProps {
  status: VerificationOutcome | CertificateStatus | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const normalized = (status || "").toUpperCase();

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] font-semibold gap-1.5",
    md: "px-3.5 py-1 text-xs font-bold gap-2",
    lg: "px-4 py-2 text-sm font-extrabold gap-2.5",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  switch (normalized) {
    case "VERIFIED":
    case "ACTIVE":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className={`${iconSizes} text-emerald-400 shrink-0`} />}
          <span className="tracking-wide">VERIFIED AUTHENTIC</span>
        </span>
      );

    case "TAMPERED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)] animate-pulse ${sizeClasses}`}
        >
          {showIcon && <AlertTriangle className={`${iconSizes} text-rose-400 shrink-0`} />}
          <span className="tracking-wide">TAMPER DETECTED</span>
        </span>
      );

    case "REVOKED":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] ${sizeClasses}`}
        >
          {showIcon && <XCircle className={`${iconSizes} text-amber-400 shrink-0`} />}
          <span className="tracking-wide">OFFICIALLY REVOKED</span>
        </span>
      );

    case "PENDING":
    case "PENDING_BLOCKCHAIN":
    case "PENDING_BLOCKCHAIN_CONFIRMATION":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)] ${sizeClasses}`}
        >
          {showIcon && <Clock className={`${iconSizes} animate-spin text-sky-400 shrink-0`} />}
          <span className="tracking-wide">CONFIRMING ON-CHAIN</span>
        </span>
      );

    case "BLOCKCHAIN_VERIFICATION_UNAVAILABLE":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 ${sizeClasses}`}
        >
          {showIcon && <ShieldAlert className={`${iconSizes} text-slate-400 shrink-0`} />}
          <span className="tracking-wide">CHAIN OFFLINE</span>
        </span>
      );

    case "NOT_FOUND":
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 ${sizeClasses}`}
        >
          {showIcon && <HelpCircle className={`${iconSizes} text-slate-400 shrink-0`} />}
          <span className="tracking-wide">RECORD NOT FOUND</span>
        </span>
      );
  }
};
