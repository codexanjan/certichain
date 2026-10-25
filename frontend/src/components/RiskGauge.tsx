import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, CheckCircle2, XCircle } from "lucide-react";
import { FraudAnalysisResult } from "../types";

interface RiskGaugeProps {
  fraudRisk: FraudAnalysisResult;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ fraudRisk }) => {
  const { riskScore, classification, reasons } = fraudRisk;

  // Determine styling & gradient colors based on risk score
  let strokeColor = "#10B981"; // Emerald
  let textColor = "text-emerald-400";
  let bgBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]";
  let Icon = ShieldCheck;
  let summaryText = "Cryptographic integrity verified. No anomaly indicators detected.";

  if (riskScore > 20 && riskScore <= 40) {
    strokeColor = "#38BDF8"; // Sky
    textColor = "text-sky-400";
    bgBadge = "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]";
    summaryText = "Minor metadata discrepancies observed. Blockchain confirmation intact.";
  } else if (riskScore > 40 && riskScore <= 70) {
    strokeColor = "#F59E0B"; // Amber
    textColor = "text-amber-400";
    bgBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]";
    Icon = AlertTriangle;
    summaryText = "Elevated risk factors detected. Certificate may be revoked or unconfirmed.";
  } else if (riskScore > 70) {
    strokeColor = "#F43F5E"; // Rose
    textColor = "text-rose-400";
    bgBadge = "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)]";
    Icon = AlertOctagon;
    summaryText = "Critical security anomaly. Raw-byte SHA-256 hash or contract proof mismatch.";
  }

  // Circular gauge math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, riskScore)) / 100) * circumference;

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-navy-900/80 backdrop-blur-xl p-6 shadow-card transition-all">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Icon className={`w-4 h-4 ${textColor}`} />
            <span>Fraud Risk Intelligence</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Explainable heuristic assessment decoupled from EVM mathematical consensus
          </p>
        </div>
        <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${bgBadge}`}>
          {(classification || "LOW").replace("_", " ")} RISK
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-5">
        {/* Animated Circular Gauge Instrument */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="stroke-navy-800"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke={strokeColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: `drop-shadow(0 0 6px ${strokeColor}66)`,
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-black tracking-tight ${textColor}`}>
                {riskScore}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                / 100 Score
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center max-w-[200px] mt-1 font-medium">
            {summaryText}
          </p>
        </div>

        {/* Factors and Explanations */}
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Integrity Verification Factors:
          </h4>
          <ul className="space-y-2 text-xs">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, idx) => {
                const isAlert =
                  reason.toLowerCase().includes("not match") ||
                  reason.toLowerCase().includes("revoked") ||
                  reason.toLowerCase().includes("not found") ||
                  reason.toLowerCase().includes("tampered") ||
                  reason.toLowerCase().includes("mismatch");

                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all ${
                      isAlert
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-white/[0.02] border-white/[0.05] text-slate-300"
                    }`}
                  >
                    {isAlert ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed font-medium">{reason}</span>
                  </li>
                );
              })
            ) : (
              <li className="flex items-center gap-2 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>All cryptographic proof constraints fully satisfied</span>
              </li>
            )}
          </ul>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/[0.05]">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Smart contracts provide immutable mathematical proof; heuristic engine prevents social engineering.</span>
          </div>
        </div>
      </div>
    </article>
  );
};
