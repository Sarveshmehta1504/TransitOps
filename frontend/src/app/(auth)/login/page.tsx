"use client";

import React, { useState } from "react";
import { loginSchema } from "@/lib/validators/schemas";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/toast-provider";
import { useTheme } from "@/providers/theme-provider";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Truck,
  Users,
  Compass,
  BarChart3,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { UserRole } from "@/types/user";

const ROLE_CONFIG = [
  {
    role: "Fleet Manager" as UserRole,
    email: "fleet@transitops.com",
    icon: Truck,
    access: "Fleet, Drivers, Maintenance, Analytics",
    color: "from-blue-600/20 to-blue-600/5 border-blue-500/30 hover:border-blue-500/60",
    lightColor: "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
    activeColor: "from-blue-600/30 to-blue-600/10 border-blue-500 shadow-blue-500/20",
    lightActiveColor: "bg-blue-50 border-blue-500 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/50",
    iconColor: "text-blue-400",
    lightIconColor: "text-blue-700",
  },
  {
    role: "Dispatcher" as UserRole,
    email: "dispatcher@transitops.com",
    icon: Compass,
    access: "Fleet (view), Trips",
    color: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/30 hover:border-indigo-500/60",
    lightColor: "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
    activeColor: "from-indigo-600/30 to-indigo-600/10 border-indigo-500 shadow-indigo-500/20",
    lightActiveColor: "bg-indigo-50 border-indigo-500 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/50",
    iconColor: "text-indigo-400",
    lightIconColor: "text-indigo-700",
  },
  {
    role: "Safety Officer" as UserRole,
    email: "safety@transitops.com",
    icon: Users,
    access: "Drivers, Trips (view)",
    color: "from-amber-600/20 to-amber-600/5 border-amber-500/30 hover:border-amber-500/60",
    lightColor: "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
    activeColor: "from-amber-600/30 to-amber-600/10 border-amber-500 shadow-amber-500/20",
    lightActiveColor: "bg-amber-50 border-amber-500 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/50",
    iconColor: "text-amber-400",
    lightIconColor: "text-amber-700",
  },
  {
    role: "Financial Analyst" as UserRole,
    email: "finance@transitops.com",
    icon: BarChart3,
    access: "Fleet (view), Fuel & Expenses, Analytics",
    color: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-500/60",
    lightColor: "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
    activeColor: "from-emerald-600/30 to-emerald-600/10 border-emerald-500 shadow-emerald-500/20",
    lightActiveColor: "bg-emerald-50 border-emerald-500 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/50",
    iconColor: "text-emerald-400",
    lightIconColor: "text-emerald-700",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const { isLight, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("Dispatcher");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    if (isLocked) return;
    setSelectedRole(role);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setErrors({ general: "Account locked after 5 failed attempts. Contact your administrator." });
      return;
    }
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      await login({ email, password, role: selectedRole });
      toast(`Welcome back!`, "success");
      window.location.href = "/";
    } catch (err: any) {
      const nextFailCount = failedCount + 1;
      setFailedCount(nextFailCount);
      if (nextFailCount >= 5) {
        setIsLocked(true);
        setErrors({ general: "Account locked after 5 failed attempts. Contact your administrator." });
        toast("Account locked due to consecutive failures", "error");
      } else {
        setErrors({ general: err.message || `Invalid credentials. ${5 - nextFailCount} attempt${5 - nextFailCount !== 1 ? "s" : ""} remaining.` });
        toast("Authentication failed", "error");
      }
    }
  };

  const activeConfig = ROLE_CONFIG.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row select-none overflow-y-auto lg:overflow-hidden" style={{ background: "var(--background)" }}>
      {/* ── LEFT PANEL: branding + role selector ── */}
      <div 
        className="flex w-full lg:w-[480px] shrink-0 flex-col relative lg:overflow-hidden border-b lg:border-b-0 lg:border-r"
        style={{ 
          background: "var(--surface-1)", 
          borderColor: "var(--border-subtle)" 
        }}
      >
        {/* Subtle background geometry */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-600/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-full bg-gradient-to-r from-transparent via-slate-800/10 to-transparent" />
        </div>

        <div className="relative flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-xl shadow-indigo-600/30">
              T
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>TransitOps</div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: isLight ? "#6366f1" : "#818cf8" }}>Smart Transport Platform</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              One platform.<br />
              <span style={{ color: isLight ? "#4f46e5" : "#818cf8" }}>Four roles.</span>
            </h1>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Select your role below to pre-fill credentials and access your scoped dashboard.
            </p>
          </div>

          {/* Role cards */}
          <div className="space-y-3 flex-grow">
            {ROLE_CONFIG.map((rc) => {
              const isActive = selectedRole === rc.role;
              return (
                <button
                  key={rc.role}
                  type="button"
                  onClick={() => handleSelectRole(rc.role)}
                  disabled={isLocked}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                    isActive
                      ? isLight ? rc.lightActiveColor : `bg-gradient-to-r ${rc.activeColor}`
                      : isLight ? rc.lightColor : `bg-gradient-to-r ${rc.color}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? (isLight ? "bg-white/50" : "bg-white/10") : (isLight ? "bg-slate-100" : "bg-slate-900/60")}`}>
                      <rc.icon className={`h-4.5 w-4.5 ${isLight ? rc.lightIconColor : rc.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isActive ? (isLight ? "text-slate-900" : "text-white") : (isLight ? "text-slate-700" : "text-slate-300")}`}>
                        {rc.role}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 truncate ${isLight ? "text-slate-500" : "text-slate-500"}`}>{rc.email}</div>
                    </div>
                    {isActive && (
                      <div className={`h-2 w-2 rounded-full shrink-0 ${isLight ? "bg-indigo-600" : "bg-indigo-400"}`} />
                    )}
                  </div>
                  <div className={`text-[10px] mt-2 ml-12 transition-colors ${isActive ? (isLight ? "text-slate-600" : "text-slate-400") : (isLight ? "text-slate-400" : "text-slate-600")}`}>
                    Access: {rc.access}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              TransitOps &copy; 2026 &middot; RBAC Enforced
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: form ── */}
      <div 
        className="flex-1 flex flex-col items-center justify-center relative lg:overflow-hidden pb-12 lg:pb-0"
        style={{ background: "var(--background)" }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        {/* Theme Toggle (Top Right) */}
        <div className="fixed top-6 right-6 z-50">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200"
            style={{
              background: isLight ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.4)",
              border: isLight
                ? "1px solid rgba(0,0,0,0.05)"
                : "1px solid rgba(255,255,255,0.05)",
              boxShadow: isLight ? "0 2px 10px rgba(0,0,0,0.03)" : "none",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center gap-2">
              {isLight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              <span className="text-xs font-semibold mr-1" style={{ color: "var(--text-secondary)" }}>
                {isLight ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
            
            {/* Toggle switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative shrink-0 focus:outline-none"
              style={{ width: 40, height: 22 }}
            >
              <span
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(99,102,241,0.2)",
                  border: isLight
                    ? "1px solid rgba(99,102,241,0.5)"
                    : "1px solid rgba(99,102,241,0.3)",
                }}
              />
              <span
                className="absolute top-[3px] rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: 16,
                  height: 16,
                  left: isLight ? "calc(100% - 19px)" : "3px",
                  background: isLight ? "#ffffff" : "#818cf8",
                  boxShadow: isLight
                    ? "0 1px 4px rgba(0,0,0,0.2)"
                    : "0 0 8px rgba(129,140,248,0.6)",
                }}
              />
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 mt-8 lg:mt-0">

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Sign in
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
              Signed in as{" "}
              <span className={`font-semibold ${isLight ? (activeConfig?.lightIconColor ?? "text-indigo-600") : (activeConfig?.iconColor ?? "text-indigo-400")}`}>
                {selectedRole}
              </span>
            </p>
          </div>

          {/* Error banner */}
          {errors.general && (
            <div className={`mb-6 p-4 border rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
              isLight ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none transition-colors ${
                    errors.email 
                      ? (isLight ? "border-rose-400 focus:border-rose-500" : "border-rose-500/50 focus:border-rose-500") 
                      : (isLight ? "border-slate-200 hover:border-slate-300 focus:border-indigo-500 bg-white text-slate-900" : "border-slate-800 hover:border-slate-700 focus:border-indigo-500 bg-slate-900 text-slate-200")
                  }`}
                  style={{
                    backgroundColor: isLight ? "#ffffff" : "var(--surface-1)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="your@transitops.in"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border pl-11 pr-12 py-3 text-sm rounded-xl focus:outline-none transition-colors ${
                    errors.password 
                      ? (isLight ? "border-rose-400 focus:border-rose-500" : "border-rose-500/50 focus:border-rose-500") 
                      : (isLight ? "border-slate-200 hover:border-slate-300 focus:border-indigo-500 bg-white text-slate-900" : "border-slate-800 hover:border-slate-700 focus:border-indigo-500 bg-slate-900 text-slate-200")
                  }`}
                  style={{
                    backgroundColor: isLight ? "#ffffff" : "var(--surface-1)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Role (RBAC)
              </label>
              <select
                value={selectedRole}
                disabled={isLocked}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  const config = ROLE_CONFIG.find((r) => r.role === role);
                  if (config) handleSelectRole(role);
                }}
                className={`w-full border text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors appearance-none cursor-pointer ${
                  isLight ? "border-slate-200 hover:border-slate-300 focus:border-indigo-500 bg-white text-slate-900" : "border-slate-800 hover:border-slate-700 focus:border-indigo-500 bg-slate-900 text-slate-200"
                }`}
                style={{
                  backgroundColor: isLight ? "#ffffff" : "var(--surface-1)",
                  color: "var(--text-primary)",
                }}
              >
                {ROLE_CONFIG.map((rc) => (
                  <option key={rc.role} value={rc.role}>{rc.role}</option>
                ))}
              </select>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group" style={{ color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  className={`rounded-sm focus:ring-0 focus:ring-offset-0 cursor-pointer ${isLight ? "bg-white border-slate-300 text-indigo-600" : "bg-slate-900 border-slate-700 text-indigo-600"}`}
                />
                <span className="transition-colors hover:opacity-80">Remember me</span>
              </label>
              <a href="#" className="font-medium transition-colors hover:opacity-80" style={{ color: isLight ? "#4f46e5" : "#818cf8" }}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn || isLocked}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] mt-2"
            >
              <span>{isLoggingIn ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* RBAC scope strip */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Access scope by role
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_CONFIG.map((rc) => (
                <div key={rc.role} className={`p-2.5 rounded-xl border bg-gradient-to-r transition-all duration-200 ${
                  selectedRole === rc.role 
                    ? (isLight ? rc.lightActiveColor : rc.activeColor) 
                    : (isLight ? "border-slate-100 from-slate-50 to-white" : "border-slate-900 from-slate-900 to-slate-900")
                }`}>
                  <div className={`text-[10px] font-bold mb-0.5 ${isLight ? rc.lightIconColor : rc.iconColor}`}>{rc.role}</div>
                  <div className="text-[9px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{rc.access}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
