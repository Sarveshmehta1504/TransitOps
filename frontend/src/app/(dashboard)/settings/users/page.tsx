"use client";

import React, { useState } from "react";
import { RoleGate } from "@/components/layout/RoleGate";
import { useToast } from "@/providers/toast-provider";
import { ShieldCheck, Info } from "lucide-react";

export default function SettingsUsersPage() {
  const { toast } = useToast();
  const [depotName, setDepotName] = useState("Gandhinagar Depot GJ4");

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Depot configuration saved successfully", "success");
  };

  // Enforced RBAC matrix rules
  const rbacMatrix = [
    { role: "Fleet Manager", fleet: "Full", drivers: "Full", trips: "No Access", fuel: "No Access", analytics: "Full" },
    { role: "Dispatcher", fleet: "View-Only", drivers: "No Access", trips: "Full", fuel: "No Access", analytics: "No Access" },
    { role: "Safety Officer", fleet: "No Access", drivers: "Full", trips: "View-Only", fuel: "No Access", analytics: "No Access" },
    { role: "Financial Analyst", fleet: "View-Only", drivers: "No Access", trips: "No Access", fuel: "Full", analytics: "Full" },
  ];

  const getPermissionBadgeStyle = (perm: string) => {
    switch (perm) {
      case "Full":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "View-Only":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "No Access":
      default:
        return "text-slate-500 bg-slate-950 border-slate-900";
    }
  };

  return (
    <RoleGate allowedRoles={["Fleet Manager"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure system parameters and view system access controls.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Section */}
          <div className="lg:col-span-1 glass-panel border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
              General Parameters
            </h3>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Depot Name</label>
                <input
                  type="text"
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Gandhinagar Depot"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</label>
                <input
                  type="text"
                  value="INR (Rs)"
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-900 text-slate-500 text-sm px-4 py-2.5 rounded-xl cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance Unit</label>
                <input
                  type="text"
                  value="Kilometers"
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-900 text-slate-500 text-sm px-4 py-2.5 rounded-xl cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98] mt-6"
              >
                Save changes
              </button>
            </form>
          </div>

          {/* RBAC Reference Section */}
          <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
              Role-Based Access (RBAC) Enforcements
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-550">
                    <th className="py-2.5 font-semibold uppercase">Role</th>
                    <th className="py-2.5 font-semibold uppercase">Fleet</th>
                    <th className="py-2.5 font-semibold uppercase">Drivers</th>
                    <th className="py-2.5 font-semibold uppercase">Trips</th>
                    <th className="py-2.5 font-semibold uppercase">Fuel/Exp.</th>
                    <th className="py-2.5 font-semibold uppercase">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {rbacMatrix.map((row) => (
                    <tr key={row.role} className="hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-200">{row.role}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getPermissionBadgeStyle(row.fleet)}`}>
                          {row.fleet}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getPermissionBadgeStyle(row.drivers)}`}>
                          {row.drivers}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getPermissionBadgeStyle(row.trips)}`}>
                          {row.trips}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getPermissionBadgeStyle(row.fuel)}`}>
                          {row.fuel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getPermissionBadgeStyle(row.analytics)}`}>
                          {row.analytics}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-slate-950 border border-slate-850 rounded-2xl flex gap-3 text-slate-500">
              <Info className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="text-[11px] leading-normal">
                This matrix is read-only reference documentation of the active RBAC policies enforced client-side and verified by the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
