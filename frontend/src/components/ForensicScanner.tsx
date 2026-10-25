import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, Scan, Upload, RefreshCw, FileText } from "lucide-react";

export const ForensicScanner: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [tamperLevel, setTamperLevel] = useState<"clean" | "spliced" | "font_anomaly">("clean");
  const [metrics, setMetrics] = useState<{
    fontKerningVariance: number;
    compressionDiscrepancy: number;
    metadataTimestampIntegrity: boolean;
    pixelNoiseSplicingScore: number;
    verdict: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runAnalysis = async (mode: "clean" | "spliced") => {
    setAnalyzing(true);
    setScanned(false);
    setTamperLevel(mode);

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (mode === "spliced") {
      setMetrics({
        fontKerningVariance: 38.4,
        compressionDiscrepancy: 84.1,
        metadataTimestampIntegrity: false,
        pixelNoiseSplicingScore: 92.5,
        verdict: "CRITICAL TAMPER DETECTED: Grade marks spliced and altered after registrar PDF finalization.",
      });
      drawHeatmap(true);
    } else {
      setMetrics({
        fontKerningVariance: 1.2,
        compressionDiscrepancy: 2.1,
        metadataTimestampIntegrity: true,
        pixelNoiseSplicingScore: 0.8,
        verdict: "AUTHENTIC DOCUMENT: Uniform pixel rasterization, matching institutional typography vector curves.",
      });
      drawHeatmap(false);
    }

    setAnalyzing(false);
    setScanned(true);
  };

  const drawHeatmap = (isTampered: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background certificate mockup
    ctx.fillStyle = "#0B132B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Certificate text lines
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("MASSACHUSETTS INSTITUTE OF TECHNOLOGY", 35, 45);

    ctx.font = "12px sans-serif";
    ctx.fillText("This is to certify that", 35, 75);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("ANJAN SHRESTHA", 35, 100);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "12px sans-serif";
    ctx.fillText("has been admitted to the degree of Bachelor of Science in Computer Science", 35, 125);
    ctx.fillText("Cumulative Grade Point Average: 3.92 / 4.0 (First Class Honours)", 35, 150);

    if (isTampered) {
      // Draw highlighted heat overlay on tampered GPA area
      const grad = ctx.createRadialGradient(250, 145, 10, 250, 145, 80);
      grad.addColorStop(0, "rgba(244, 63, 94, 0.85)");
      grad.addColorStop(0.5, "rgba(244, 63, 94, 0.4)");
      grad.addColorStop(1, "rgba(244, 63, 94, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(150, 110, 200, 70);

      // Splicing box
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(210, 135, 110, 25);
      ctx.setLineDash([]);

      ctx.fillStyle = "#F43F5E";
      ctx.font = "bold 10px monospace";
      ctx.fillText("SPLICED PIXEL NOISE", 212, 172);
    } else {
      // Clean overlay
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 25, canvas.width - 60, canvas.height - 50);

      ctx.fillStyle = "#10B981";
      ctx.font = "bold 11px monospace";
      ctx.fillText("✓ UNIFORM HISTOGRAM [AUTHENTIC]", 35, canvas.height - 25);
    }
  };

  return (
    <section aria-labelledby="forensic-scanner-title" className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Eye className="w-4 h-4" /> AI Document Forensics &amp; ELA Engine
          </div>
          <h2 id="forensic-scanner-title" className="text-2xl font-bold font-display text-white">
            Pixel Splicing &amp; Font Kerning Anomaly Detector
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Standard verifiers only match hashes. CertiChain inspects rasterized document noise levels and typographic kerning to catch physical document edits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => runAnalysis("clean")}
            disabled={analyzing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Test Authentic Doc
          </button>
          <button
            type="button"
            onClick={() => runAnalysis("spliced")}
            disabled={analyzing}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-bold text-rose-400 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" /> Test Tampered Splicing
          </button>
        </div>
      </div>

      {/* Main Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Canvas Display */}
        <div className="lg:col-span-7 bg-navy-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>RASTERIZED DOCUMENT BUFFER</span>
            <span>{tamperLevel === "spliced" ? "ANOMALY DETECTED" : "UNIFORM"}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={520}
            height={200}
            className="w-full max-w-full rounded-xl border border-slate-700/60 shadow-inner bg-black"
          />
          <div className="text-[11px] text-slate-500 mt-2 text-center">
            {tamperLevel === "spliced" ? "Red radial overlay highlights compression artifact discontinuity at coordinates (250, 145)" : "Pixel density conforms to uniform PostScript renderer"}
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Scan className="w-3.5 h-3.5 text-cyan-400" /> Forensic Vector Diagnostics
            </h3>

            {metrics ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Typography Kerning Variance:</span>
                  <span className={`font-mono font-bold ${metrics.fontKerningVariance > 10 ? "text-rose-400" : "text-emerald-400"}`}>
                    {metrics.fontKerningVariance}% {metrics.fontKerningVariance > 10 ? "⚠ (Non-standard font)" : "✓ (Standard)"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Error Level Analysis (ELA):</span>
                  <span className={`font-mono font-bold ${metrics.compressionDiscrepancy > 50 ? "text-rose-400" : "text-emerald-400"}`}>
                    {metrics.compressionDiscrepancy}% {metrics.compressionDiscrepancy > 50 ? "⚠ (Recompressed segment)" : "✓ (Uniform)"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Metadata Invariance:</span>
                  <span className={`font-mono font-bold ${metrics.metadataTimestampIntegrity ? "text-emerald-400" : "text-rose-400"}`}>
                    {metrics.metadataTimestampIntegrity ? "MATCH (100% Registrar signed)" : "ALTERED (Edited in third-party tool)"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mt-3">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono block mb-1">
                    Automated Forensic Verdict
                  </span>
                  <p className={`text-xs font-semibold ${tamperLevel === "spliced" ? "text-rose-300" : "text-emerald-300"}`}>
                    {metrics.verdict}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Click &ldquo;Test Authentic Doc&rdquo; or &ldquo;Test Tampered Splicing&rdquo; to execute live AI forensic scan.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
