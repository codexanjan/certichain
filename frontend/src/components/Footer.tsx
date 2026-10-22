import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, FileCode, Cpu, Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100 dark:border-slate-800">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Certi<span className="text-brand-500">Chain</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Decentralized academic credential trust layer powered by EVM smart contracts, cryptographic SHA-256 byte hashing, and explainable fraud risk analysis.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              EVM Hardhat Localnet Ready
            </div>
          </div>

          {/* Verification Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Verification</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/verify" className="hover:text-brand-500 transition">Instant Certificate Lookup</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-brand-500 transition">Scan Credential QR Code</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-brand-500 transition">Upload PDF for Byte Check</Link>
              </li>
              <li>
                <Link to="/verify/CERT-2026-000123" className="hover:text-brand-500 transition">Demo MIT Verified Degree</Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Protocol Pillars</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-500" />
                <span>Zero PII on Public Chains</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-brand-500" />
                <span>Raw-Byte SHA-256 Hashes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-500" />
                <span>EVM Smart Contracts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>Rule-Based Anomaly Scoring</span>
              </li>
            </ul>
          </div>

          {/* Institutional Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Portals</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/login" className="hover:text-brand-500 transition">Institution Issuer Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-500 transition">Student Credential Wallet</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-500 transition">Super Administrator Audit</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-brand-500 transition">Apply for Issuer Accreditation</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CertiChain Protocol. Engineered for final-year engineering defense and live verification demonstrations.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-500">v1.0.0 Production Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
