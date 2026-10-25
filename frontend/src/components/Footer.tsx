import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, FileCode, Cpu, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-navy-1000 border-t border-white/[0.08] pt-20 pb-12 transition-colors relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16 border-b border-white/[0.08]">
          {/* Brand & Overview */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 w-fit" aria-label="CertiChain Home">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-navy-950 font-bold shadow-glow-cyan">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Certi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Chain</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Cryptographic academic credential trust layer powered by EVM smart contracts, raw-byte SHA-256 binary digests, and explainable fraud risk classification.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EVM Smart Contracts Active</span>
            </div>
          </div>

          {/* Verification Links */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Verification Engine</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/verify" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Instant Certificate Lookup
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Scan Credential QR Code
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Raw Byte PDF Hash Analysis
                </Link>
              </li>
              <li>
                <Link to="/verify/CERT-2026-000789" className="hover:text-cyan-400 transition-colors py-1 inline-block flex items-center gap-1 text-slate-300">
                  <span>Demo Verified Degree</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Protocol Pillars */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Protocol Pillars</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Zero PII on Public Chain</span>
              </li>
              <li className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Raw-Byte SHA-256 Digestion</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Solidity 0.8.28 Contracts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Explainable Fraud Scoring</span>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Stakeholder Access</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Institution Issuer Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Student Credential Wallet
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors py-1 inline-block">
                  Super Admin Governance
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-cyan-400 transition-colors py-1 inline-block text-cyan-400 font-semibold">
                  Accreditation Application →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CertiChain Protocol. Engineered for verifiable academic truth, zero gas public audits, and GDPR/FERPA compliance.</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-lg text-slate-400">
              Contract: 0x5FbD...aa3
            </span>
            <span className="text-[11px] font-mono bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-cyan-400 font-semibold">
              v1.0.0 Mainnet Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
