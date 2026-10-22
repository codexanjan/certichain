import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserCheck, Building, Mail, Lock, User, Globe, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-glow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create an Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose whether you are registering as a Student or applying as an Educational Institution.
        </p>

        {/* Mode Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 mt-2">
          <button
            type="button"
            onClick={() => {
              setMode("student");
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              mode === "student"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Student Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("issuer");
              setErrorMsg(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              mode === "issuer"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Institution / Issuer Application
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-navy-900 py-8 px-4 sm:px-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium space-y-2 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
              <p className="font-bold">{successMsg}</p>
              <Link to="/login" className="inline-block text-xs font-bold underline mt-1">
                Return to Sign In
              </Link>
            </div>
          )}

          {!successMsg && mode === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition shadow-glow mt-2"
              >
                {loading ? "Creating Account..." : "Register as Student"}
              </button>
            </form>
          )}

          {!successMsg && mode === "issuer" && (
            <form onSubmit={handleIssuerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Oxford University"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Institution Code
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                    placeholder="e.g. OXFORD"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="registrar@oxford.ac.uk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://oxford.ac.uk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Authorized Representative Details:
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Representative Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Prof. / Dr. Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="rep@oxford.ac.uk"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Account Password
                    </label>
                    <input
                      type="password"
                      required
                      value={applicantPassword}
                      onChange={(e) => setApplicantPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Note: Institutional accounts require Super Admin accreditation before certificate issuance rights are activated.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition shadow-glow"
              >
                {loading ? "Submitting Application..." : "Submit Issuer Accreditation Application"}
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
