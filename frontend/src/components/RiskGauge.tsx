import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { FraudAnalysisResult } from "../types";

interface RiskGaugeProps {
  fraudRisk: FraudAnalysisResult;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ fraudRisk }) => {
  const { riskScore, classification, reasons } = fraudRisk;

  // Determine styling based on score
  let strokeColor = "#10B981"; // Emerald
  let textColor = "text-emerald-500";
  let bgBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  let Icon = ShieldCheck;

  if (riskScore > 20 && riskScore <= 40) {
    strokeColor = "#3B82F6"; // Blue
    textColor = "text-blue-500";
    bgBadge = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
  } else if (riskScore > 40 && riskScore <= 60) {
    strokeColor = "#F59E0B"; // Amber
    textColor = "text-amber-500";
    bgBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    Icon = AlertTriangle;
  } else if (riskScore > 60) {
    strokeColor = "#EF4444"; // Red
    textColor = "text-rose-500";
    bgBadge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    Icon = AlertOctagon;
  }

  // Circular gauge math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-card">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon className={`w-5 h-5 ${textColor}`} />
            Fraud Risk Assessment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rule-based anomaly scoring (decoupled from blockchain proof)
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bgBadge}`}>
          {classification.replace("_", " ")} RISK
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-6">
        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold ${textColor}`}>{riskScore}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">/ 100 Score</span>
            </div>
          </div>
        </div>

        {/* Factors and Explanations */}
        <div className="md:col-span-2 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Breakdown:</h4>
          <ul className="space-y-1.5 text-xs">
            {reasons.map((reason, idx) => {
              const isAlert = reason.toLowerCase().includes("not match") || reason.toLowerCase().includes("revoked") || reason.toLowerCase().includes("not found");
              return (
                <li key={idx} className="flex items-start gap-2">
                  {isAlert ? (
                    <span className="text-rose-500 mt-0.5 font-bold">⚠</span>
                  ) : (
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                  )}
                  <span className={isAlert ? "text-rose-600 dark:text-rose-400 font-medium" : "text-slate-600 dark:text-slate-300"}>
                    {reason}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>High risk flags discrepancies for manual review; blockchain provides mathematical truth.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
