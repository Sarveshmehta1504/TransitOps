"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
// Oh, did we install @hookform/resolvers? No, let's install it! Or we can do manual validation in onSubmit or use standard zod parse. Let's install it first to be absolutely clean and follow Next/TS practices.
import { loginSchema, LoginInput } from "@/lib/validators/schemas";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/toast-provider";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { UserRole } from "@/types/user";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Fleet Manager");

  const [email, setEmail] = useState("manager@transitops.com");
  const [password, setPassword] = useState("password123");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const roleTemplates = [
    { role: "Fleet Manager" as UserRole, email: "manager@transitops.com", label: "Manager" },
    { role: "Driver" as UserRole, email: "driver@transitops.com", label: "Driver" },
    { role: "Safety Officer" as UserRole, email: "safety@transitops.com", label: "Safety" },
    { role: "Financial Analyst" as UserRole, email: "analyst@transitops.com", label: "Finance" },
  ];

  const selectRoleTemplate = (role: UserRole, mail: string) => {
    setSelectedRole(role);
    setEmail(mail);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      await login({ email, role: selectedRole });
      toast(`Welcome back, ${selectedRole}!`, "success");
      // Force page reload to apply middleware redirects
      window.location.href = "/";
    } catch (err: any) {
      toast(err.message || "Failed to authenticate", "error");
    }
  };

  return (
    <div className="w-full glass-panel border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Glow bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-2xl mb-4 shadow-lg shadow-indigo-500/5">
          T
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Sign In to TransitOps
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter credentials or select a role to evaluate the platform
        </p>
      </div>

      {/* Role Shortcuts Grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Role Templates (Evaluator Mode)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {roleTemplates.map((t) => (
            <button
              key={t.role}
              type="button"
              onClick={() => selectRoleTemplate(t.role, t.email)}
              className={`text-xs py-2 px-3 rounded-xl border font-medium text-left transition-all duration-200 ${
                selectedRole === t.role
                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="font-semibold truncate">{t.label}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{t.email}</div>
            </button>
          ))}
        </div>
      </div>

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
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-slate-950 border pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200 transition-colors ${
                errors.email ? "border-rose-500/50" : "border-slate-800"
              }`}
              placeholder="e.g. manager@transitops.com"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 select-none mt-6"
        >
          <span>{isLoggingIn ? "Signing In..." : "Continue to Platform"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
