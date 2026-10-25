import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await login(email, password);
      if (user.role === "SUPER_ADMIN") navigate("/admin");
      else if (user.role === "INSTITUTION_ISSUER") navigate("/issuer");
      else navigate("/student");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const user = await googleSignIn();
      navigate(user.role === "SUPER_ADMIN" ? "/admin" : user.role === "INSTITUTION_ISSUER" ? "/issuer" : "/student");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Google Sign-In failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-navy-950 mx-auto shadow-glow-cyan font-bold">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Sign In to CertiChain
        </h1>
        <p className="text-xs text-slate-300">
          Powered by real Firebase Auth &amp; Firestore with 1-click Demo fast-fills.
        </p>
      </header>

      <main className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <section aria-labelledby="signin-form-title" className="bg-navy-900/90 py-8 px-5 sm:px-10 rounded-3xl border border-white/10 shadow-card backdrop-blur-2xl space-y-6">
          <h2 id="signin-form-title" className="sr-only">Sign In Credentials Form</h2>
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {loading ? "Authenticating with Firebase..." : "Sign In to CertiChain"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition flex items-center justify-center gap-2.5 min-h-[44px] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {googleLoading ? "Connecting to Google..." : "Continue with Google (Firebase SSO)"}
            </button>
          </form>

          {/* Quick Demo One-Click Selectors */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <span className="block text-[11px] font-mono text-center text-slate-400 font-semibold">
              Instant Demo Fast-Fill:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@certichain.io", "Admin@123")}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-200 transition text-center min-h-[44px] flex flex-col justify-center"
              >
                <span className="font-bold text-cyan-400">Super Admin</span>
                <span className="text-[9px] text-slate-400">admin@certi...</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("mit-registrar@mit.edu", "Issuer@123")}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-200 transition text-center min-h-[44px] flex flex-col justify-center"
              >
                <span className="font-bold text-sky-400">MIT Issuer</span>
                <span className="text-[9px] text-slate-400">mit-reg@mit...</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("alice@mit.edu", "Student@123")}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-200 transition text-center min-h-[44px] flex flex-col justify-center"
              >
                <span className="font-bold text-emerald-400">Graduate</span>
                <span className="text-[9px] text-slate-400">alice@mit.edu</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1">
              Create an Account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
