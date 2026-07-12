"use client";

import React, { useState } from "react";
import { loginSchema } from "@/lib/validators/schemas";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/toast-provider";
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
} from "lucide-react";
import { UserRole } from "@/types/user";

const ROLE_CONFIG = [
  {
    role: "Fleet Manager" as UserRole,
    email: "manager@transitops.in",
    icon: Truck,
    access: "Fleet, Drivers, Maintenance, Analytics",
    color: "from-blue-600/20 to-blue-600/5 border-blue-500/30 hover:border-blue-500/60",
    activeColor: "from-blue-600/30 to-blue-600/10 border-blue-500 shadow-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    role: "Dispatcher" as UserRole,
    email: "Raven.k@transitops.in",
    icon: Compass,
    access: "Fleet (view), Trips",
    color: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/30 hover:border-indigo-500/60",
    activeColor: "from-indigo-600/30 to-indigo-600/10 border-indigo-500 shadow-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    role: "Safety Officer" as UserRole,
    email: "safety@transitops.in",
    icon: Users,
    access: "Drivers, Trips (view)",
    color: "from-amber-600/20 to-amber-600/5 border-amber-500/30 hover:border-amber-500/60",
    activeColor: "from-amber-600/30 to-amber-600/10 border-amber-500 shadow-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    role: "Financial Analyst" as UserRole,
    email: "analyst@transitops.in",
    icon: BarChart3,
    access: "Fleet (view), Fuel & Expenses, Analytics",
    color: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-500/60",
    activeColor: "from-emerald-600/30 to-emerald-600/10 border-emerald-500 shadow-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("Raven.k@transitops.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("Dispatcher");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelectRole = (role: UserRole, mail: string) => {
    if (isLocked) return;
    setSelectedRole(role);
    setEmail(mail);
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

    const matchesRole = ROLE_CONFIG.find(
      (r) => r.role === selectedRole && r.email.toLowerCase() === email.toLowerCase()
    );

    if (!matchesRole || password !== "password123") {
      const nextFailCount = failedCount + 1;
      setFailedCount(nextFailCount);
      if (nextFailCount >= 5) {
        setIsLocked(true);
        setErrors({ general: "Account locked after 5 failed attempts. Contact your administrator." });
        toast("Account locked due to consecutive failures", "error");
      } else {
        setErrors({ general: `Invalid credentials. ${5 - nextFailCount} attempt${5 - nextFailCount !== 1 ? "s" : ""} remaining.` });
        toast("Authentication failed", "error");
      }
      return;
    }

    try {
      await login({ email, role: selectedRole });
      toast(`Welcome back!`, "success");
      window.location.href = "/";
    } catch (err: any) {
      toast(err.message || "Failed to authenticate", "error");
    }
  };

  const activeConfig = ROLE_CONFIG.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-screen w-full flex select-none overflow-hidden">
      {/* ── LEFT PANEL: branding + role selector ── */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col bg-slate-950 relative overflow-hidden border-r border-slate-900">
        {/* Subtle background geometry */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-600/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </div>

        <div className="relative flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-xl shadow-indigo-600/30">
              T
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white leading-none">TransitOps</div>
              <div className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase mt-0.5">Smart Transport Platform</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white leading-tight">
              One platform.<br />
              <span className="text-indigo-400">Four roles.</span>
            </h1>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
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
                  onClick={() => handleSelectRole(rc.role, rc.email)}
                  disabled={isLocked}
                  className={`w-full text-left p-4 rounded-2xl border bg-gradient-to-r transition-all duration-200 group ${
                    isActive
                      ? `${rc.activeColor} shadow-lg`
                      : `${rc.color}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-white/10" : "bg-slate-900/60"}`}>
                      <rc.icon className={`h-4.5 w-4.5 ${rc.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-300"}`}>
                        {rc.role}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{rc.email}</div>
                    </div>
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                    )}
                  </div>
                  <div className={`text-[10px] mt-2 ml-12 ${isActive ? "text-slate-400" : "text-slate-600"} transition-colors`}>
                    Access: {rc.access}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-900">
            <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">
              TransitOps &copy; 2026 &middot; RBAC Enforced
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0c12] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md px-8 py-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
              T
            </div>
            <span className="text-lg font-bold text-white">TransitOps</span>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Signed in as{" "}
              <span className={`font-semibold ${activeConfig?.iconColor ?? "text-indigo-400"}`}>
                {selectedRole}
              </span>
            </p>
          </div>

          {/* Error banner */}
          {errors.general && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-900 border pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-colors ${
                    errors.email ? "border-rose-500/50" : "border-slate-800 hover:border-slate-700"
                  }`}
                  placeholder="your@transitops.in"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-900 border pl-11 pr-12 py-3 text-sm rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-colors ${
                    errors.password ? "border-rose-500/50" : "border-slate-800 hover:border-slate-700"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role (RBAC)
              </label>
              <select
                value={selectedRole}
                disabled={isLocked}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  const config = ROLE_CONFIG.find((r) => r.role === role);
                  if (config) handleSelectRole(role, config.email);
                }}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                {ROLE_CONFIG.map((rc) => (
                  <option key={rc.role} value={rc.role}>{rc.role}</option>
                ))}
              </select>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-sm bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="group-hover:text-slate-400 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
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
          <div className="mt-8 pt-6 border-t border-slate-900">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Access scope by role
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_CONFIG.map((rc) => (
                <div key={rc.role} className={`p-2.5 rounded-xl border bg-gradient-to-r ${selectedRole === rc.role ? rc.activeColor : "border-slate-900 from-slate-900 to-slate-900"} transition-all duration-200`}>
                  <div className={`text-[10px] font-bold ${rc.iconColor} mb-0.5`}>{rc.role}</div>
                  <div className="text-[9px] text-slate-600 leading-relaxed">{rc.access}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
