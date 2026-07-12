"use client";

import React, { useState } from "react";
import { loginSchema } from "@/lib/validators/schemas";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/toast-provider";
import { ShieldCheck, Lock, Mail, ArrowRight, Info } from "lucide-react";
import { UserRole } from "@/types/user";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("Raven.k@transitops.in");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Dispatcher");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const roleTemplates = [
    { role: "Fleet Manager" as UserRole, email: "manager@transitops.in", label: "Fleet Manager" },
    { role: "Dispatcher" as UserRole, email: "Raven.k@transitops.in", label: "Dispatcher" },
    { role: "Safety Officer" as UserRole, email: "safety@transitops.in", label: "Safety Officer" },
    { role: "Financial Analyst" as UserRole, email: "analyst@transitops.in", label: "Financial Analyst" },
  ];

  const handleSelectRole = (role: UserRole, mail: string) => {
    if (isLocked) return;
    setSelectedRole(role);
    setEmail(mail);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setErrors({ general: "Account locked after 5 failed attempts." });
      return;
    }
    setErrors({});

    // Validate using Zod schema
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    // Check credentials logic for demo
    const matchesRole = roleTemplates.find(r => r.role === selectedRole && r.email.toLowerCase() === email.toLowerCase());
    
    // Simple logic: password is "password123" and email matches
    if (!matchesRole || password !== "password123") {
      const nextFailCount = failedCount + 1;
      setFailedCount(nextFailCount);
      if (nextFailCount >= 5) {
        setIsLocked(true);
        setErrors({ general: "Account locked after 5 failed attempts." });
        toast("Account locked due to consecutive failures", "error");
      } else {
        setErrors({ general: "Invalid credentials." });
        toast("Authentication failed", "error");
      }
      return;
    }

    try {
      await login({ email, role: selectedRole });
      toast(`Welcome back, ${selectedRole}!`, "success");
      window.location.href = "/";
    } catch (err: any) {
      toast(err.message || "Failed to authenticate", "error");
    }
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl relative min-h-[550px] select-none">
      {/* Accent glow bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600" />

      {/* Left panel: Branding */}
      <div className="bg-slate-950 p-10 flex flex-col justify-between border-r border-slate-900 relative">
        <div className="space-y-8">
          <div>
            <span className="font-sans font-bold text-2xl tracking-tight text-white block">
              TransitOps
            </span>
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase block mt-1">
              Smart Transport Operations Platform
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              One login, four roles:
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {roleTemplates.map((t) => (
                <button
                  key={t.role}
                  type="button"
                  onClick={() => handleSelectRole(t.role, t.email)}
                  disabled={isLocked}
                  className={`text-xs font-semibold py-3 px-4 rounded-xl border text-left transition-all duration-200 ${
                    selectedRole === t.role
                      ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-950/20"
                      : "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-600 tracking-wider pt-6 border-t border-slate-900/60 uppercase">
          TRANSITOPS &copy; 2026 &middot; RBAC ENABLED
        </div>
      </div>

      {/* Right panel: Credentials Form */}
      <div className="p-10 flex flex-col justify-between bg-slate-900">
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your credentials to continue
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-rose-400 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950 border pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 transition-colors ${
                    errors.email ? "border-rose-500/50" : "border-slate-800"
                  }`}
                  placeholder="Raven.k@transitops.in"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-950 border pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 transition-colors ${
                    errors.password ? "border-rose-500/50" : "border-slate-800"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Role selection dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Role (RBAC)
              </label>
              <select
                value={selectedRole}
                disabled={isLocked}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn || isLocked}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              <span>{isLoggingIn ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Access scope info banner */}
        <div className="mt-8 pt-4 border-t border-slate-850 flex gap-2.5 text-[11px] text-slate-500 leading-normal">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400 block mb-1">
              Access is scoped by role after login:
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Fleet Manager &rarr; Fleet, Maintenance</li>
              <li>Dispatcher &rarr; Dashboard, Trips</li>
              <li>Safety Officer &rarr; Drivers, Compliance</li>
              <li>Financial Analyst &rarr; Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
