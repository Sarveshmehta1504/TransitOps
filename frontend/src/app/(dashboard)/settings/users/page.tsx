"use client";

import React from "react";
import { RoleGate } from "@/components/layout/RoleGate";
import { MOCK_USERS } from "@/lib/api/auth";
import { ShieldCheck, UserPlus, Settings, Key, HelpCircle } from "lucide-react";

export default function SettingsUsersPage() {
  return (
    <RoleGate allowedRoles={["Fleet Manager"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Users & Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure system roles, operator permissions, security controls.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]">
            <UserPlus className="h-4 w-4" />
            <span>Invite User</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List Panel */}
          <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
              System Operators
            </h3>
            <div className="divide-y divide-slate-850">
              {MOCK_USERS.map((user) => (
                <div key={user.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{user.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Configs panel */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
                Configurations
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Key className="h-4.5 w-4.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">API Key Rotation</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 font-bold px-2 py-0.5 rounded uppercase">Disabled</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4.5 w-4.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">Telemetry Stream</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded uppercase">Active</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 rounded-2xl text-xs leading-relaxed flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Only authorized accounts assigned to the <span className="font-semibold text-indigo-200">Fleet Manager</span> system role are permitted to modify security access policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
