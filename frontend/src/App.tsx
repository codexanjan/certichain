import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { VerifyPage } from "./pages/VerifyPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { IssuerDashboard } from "./pages/IssuerDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "./types";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:certificateId" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Institution Issuer Portal */}
            <Route
              path="/issuer/*"
              element={
                <ProtectedRoute allowedRoles={["INSTITUTION_ISSUER", "SUPER_ADMIN"]}>
                  <IssuerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Credential Wallet */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={["STUDENT", "SUPER_ADMIN"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Super Administrator Audit Plane */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
