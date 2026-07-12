"use client";

import React from "react";
import { useAuthContext } from "@/providers/auth-provider";
import { UserRole } from "@/types/user";
import { Lock } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { role, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const isAllowed = role && allowedRoles.includes(role);

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 glass-panel border border-slate-800 rounded-2xl max-w-md mx-auto text-center mt-12">
        <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/20">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your role as <span className="text-rose-400 font-semibold">{role}</span> does not have authorization to view this resource. Please contact your administrator for credentials.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
