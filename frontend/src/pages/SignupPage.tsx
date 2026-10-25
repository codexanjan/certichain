import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserCheck, Building, Mail, Lock, User, Globe, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const SignupPage: React.FC = () => {
  const { register, submitIssuerApplication } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"student" | "issuer">("student");

  // Student form state
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Issuer form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPassword, setApplicantPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await register(studentName, studentEmail, studentPassword);
      navigate("/student");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleIssuerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await submitIssuerApplication({
        fullName: applicantName,
        email: applicantEmail,
        password: applicantPassword,
        institutionName,
        institutionCode,
        officialEmail,
        websiteUrl,
      });
      setSuccessMsg(res.message);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Application submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-navy-950 mx-auto shadow-glow-cyan font-bold">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Create CertiChain Account
        </h1>
        <p className="text-xs text-slate-300">
          Register as a Student Graduate or apply as an Educational Institution Issuer.
        </p>

        {/* Mode Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-navy-1000 border border-white/10 mt-3" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "student"}
            onClick={() => {
              setMode("student");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 min-h-[44px] ${
              mode === "student"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student Graduate</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "issuer"}
            onClick={() => {
              setMode("issuer");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 min-h-[44px] ${
              mode === "issuer"
                ? "bg-cyan-500 text-navy-950 shadow-glow-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>University Issuer</span>
          </button>
        </div>
      </header>

      <main className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <section aria-labelledby="signup-form-title" className="bg-navy-900/90 py-8 px-5 sm:px-10 rounded-3xl border border-white/10 shadow-card backdrop-blur-2xl space-y-6">
          <h2 id="signup-form-title" className="sr-only">Account Registration Form</h2>
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Application Submitted Successfully!</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">
                Your accreditation application has been queued for Super Administrator verification. You will receive activation details once review is complete.
              </p>
            </div>
          )}

          {/* Student Form */}
          {mode === "student" && !successMsg && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="student-fullname-input"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                  <input
                    id="student-fullname-input"
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alice Walker"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="student-email-input"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                  <input
                    id="student-email-input"
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="alice@mit.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="student-password-input"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                  <input
                    id="student-password-input"
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Creating Student Account..." : "Create Student Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Issuer Form */}
          {mode === "issuer" && !successMsg && (
            <form onSubmit={handleIssuerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="issuer-applicant-name"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Applicant Name
                  </label>
                  <input
                    id="issuer-applicant-name"
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Dr. Arthur Vance"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="issuer-applicant-email"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Work Email
                  </label>
                  <input
                    id="issuer-applicant-email"
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="registrar@harvard.edu"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="issuer-password-input"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="issuer-password-input"
                  type="password"
                  required
                  value={applicantPassword}
                  onChange={(e) => setApplicantPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="issuer-inst-name"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    University Legal Name
                  </label>
                  <input
                    id="issuer-inst-name"
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Harvard University"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="issuer-inst-code"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Accreditation Code
                  </label>
                  <input
                    id="issuer-inst-code"
                    type="text"
                    required
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value)}
                    placeholder="HARV-EDU"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="issuer-official-email"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Registrar Email
                  </label>
                  <input
                    id="issuer-official-email"
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="registrar@harvard.edu"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="issuer-website-url"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Official Website URL
                  </label>
                  <input
                    id="issuer-website-url"
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.harvard.edu"
                    className="w-full px-3.5 py-3 rounded-xl bg-navy-1000 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-white shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Submitting Application..." : "Submit Accreditation Application"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1">
              Sign In Instead
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
