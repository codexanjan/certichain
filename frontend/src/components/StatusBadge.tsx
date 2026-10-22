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
  const normalized = status.toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3 mr-1",
    md: "w-3.5 h-3.5 mr-1.5",
    lg: "w-4 h-4 mr-2",
  }[size];

  switch (normalized) {
    case "VERIFIED":
    case "ACTIVE":
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          {showIcon && <CheckCircle2 className={iconSizes} />}
          VERIFIED
        </span>
      );

    case "TAMPERED":
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse ${sizeClasses}`}>
          {showIcon && <AlertTriangle className={iconSizes} />}
          TAMPERED
        </span>
      );

    case "REVOKED":
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
          {showIcon && <XCircle className={iconSizes} />}
          REVOKED
        </span>
      );

    case "PENDING":
    case "PENDING_BLOCKCHAIN":
    case "PENDING_BLOCKCHAIN_CONFIRMATION":
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 ${sizeClasses}`}>
          {showIcon && <Clock className={`${iconSizes} animate-spin`} />}
          PENDING CONFIRMATION
        </span>
      );

    case "BLOCKCHAIN_VERIFICATION_UNAVAILABLE":
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 ${sizeClasses}`}>
          {showIcon && <ShieldAlert className={iconSizes} />}
          CHAIN UNAVAILABLE
        </span>
      );

    case "NOT_FOUND":
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 ${sizeClasses}`}>
          {showIcon && <HelpCircle className={iconSizes} />}
          NOT FOUND
        </span>
      );
  }
};
