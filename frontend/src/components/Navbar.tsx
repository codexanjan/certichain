import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "SUPER_ADMIN") return "/admin";
    if (user.role === "INSTITUTION_ISSUER") return "/issuer";
    return "/student";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Overview", href: "/#overview" },
    { label: "AI Forensics", href: "/verify?tab=forensics" },
    { label: "ZK Privacy", href: "/verify?tab=zk" },
    { label: "Audit Ledger", href: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-navy-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1"
            aria-label="CertiChain Homepage"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-navy-900 to-navy-950 border border-white/10 group-hover:border-cyan-400/50 shadow-glow transition-all duration-300 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="CertiChain Logo"
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <ShieldCheck className="w-6 h-6 text-cyan-400 absolute z-0" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                Certi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Chain</span>
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                  EVM Trust Layer
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-navy-900/60 border border-white/[0.06] backdrop-blur-md px-4 py-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.06] transition-all"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/verify"
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith("/verify")
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </Link>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Network Beacon */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/80 border border-white/[0.08] text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald animate-pulse" />
              <span>Hardhat Localnet</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-navy-800 to-navy-900 border border-white/10 text-white text-xs font-bold hover:border-cyan-500/40 transition shadow-sm"
                  aria-label={`Open ${user.role.replace("_", " ")} Dashboard`}
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>{user.role.replace("_", " ")}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-200 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition min-h-[44px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-xl text-navy-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition-all transform hover:-translate-y-0.5 min-h-[44px]"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] border border-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-white/10 bg-navy-950/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EVM Hardhat Localnet
              </span>
              <span className="text-[11px] bg-white/[0.06] px-2 py-0.5 rounded">v1.0.0</span>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-sm font-semibold text-slate-200 hover:text-cyan-400 transition"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-sm font-bold text-cyan-400 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Verify Academic Certificate</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 rounded-xl shadow-glow-cyan transition flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open {user.role.replace("_", " ")} Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center text-xs font-semibold text-rose-400 hover:text-rose-300 transition min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold text-slate-200 border border-white/10 hover:border-white/20 rounded-xl bg-white/[0.03] transition min-h-[44px] flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold bg-gradient-to-r from-cyan-400 to-sky-400 text-navy-950 rounded-xl shadow-glow-cyan transition flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
