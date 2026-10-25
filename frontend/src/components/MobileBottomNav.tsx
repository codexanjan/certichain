import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Eye, History, Home, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Verify", path: "/verify", icon: ShieldCheck, highlight: true },
    { label: "History", path: "/history", icon: History },
    {
      label: user ? "Dashboard" : "Login",
      path: user
        ? user.role === "SUPER_ADMIN"
          ? "/admin"
          : user.role === "INSTITUTION_ISSUER"
          ? "/issuer"
          : "/student"
        : "/login",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-1000/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 safe-area-bottom shadow-2xl shadow-black"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-cyan-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  item.highlight && isActive
                    ? "bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/30"
                    : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? "text-cyan-400" : ""}`} />
                {item.highlight && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
