"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/reports";
import {
  Truck,
  Users,
  Compass,
  Wrench,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DashboardPage() {
  const { role } = useAuthContext();

  // Filters State
  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");

  // Real backend dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: getDashboardStats,
    retry: 1,
  });

  // Wireframe Sample Recent Trips
  const recentTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
    { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "-" },
    { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "1h 10m" },
    { id: "TR006", vehicle: "-", driver: "-", status: "Draft", eta: "Awaiting vehicle" },
  ];

  const getStatusStyle = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "available":
      case "completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "on trip":
      case "dispatched":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "pending":
      case "draft":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "suspended":
      case "retired":
      case "cancelled":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  // KPI values — real data when available, fallback to static
  const kpi = {
    activeVehicles: stats ? (stats.vehicles.on_trip + stats.vehicles.in_shop) : 53,
    availableVehicles: stats ? stats.vehicles.available : 42,
    inMaintenance: stats ? stats.vehicles.in_shop : 5,
    activeTrips: stats ? stats.trips.dispatched : 18,
    pendingTrips: stats ? stats.trips.draft : 9,
    driversOnDuty: stats ? stats.drivers.on_trip : 26,
    fleetUtilization: stats
      ? Math.round(((stats.vehicles.on_trip + stats.vehicles.in_shop) / Math.max(stats.vehicles.total, 1)) * 100)
      : 81,
  };

  // Recharts Chart: Status Breakdown from real data
  const statusBreakdown = stats
    ? [
        { name: "Available", value: stats.vehicles.available, color: "#10b981" },
        { name: "On Trip", value: stats.vehicles.on_trip, color: "#3b82f6" },
        { name: "In Shop", value: stats.vehicles.in_shop, color: "#f59e0b" },
        { name: "Retired", value: stats.vehicles.retired, color: "#64748b" },
      ]
    : [
        { name: "Available", value: 42, color: "#10b981" },
        { name: "On Trip", value: 18, color: "#3b82f6" },
        { name: "In Shop", value: 5, color: "#f59e0b" },
        { name: "Retired", value: 8, color: "#64748b" },
      ];

  // RBAC Widget checks
  const canSeeAnalytics = role === "Fleet Manager" || role === "Financial Analyst";

  const Stat = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
    <div className={`glass-panel border p-4 rounded-2xl flex flex-col justify-between min-h-[100px] ${accent ? "bg-indigo-500/5 border-indigo-500/10" : "border-slate-800"}`}>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${accent ? "text-indigo-400" : "text-slate-500"}`}>{label}</span>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`text-2xl font-bold font-mono ${accent ? "text-indigo-300" : "text-slate-100"}`}>
          {statsLoading ? "—" : value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Real-time operations center and logistics monitoring.
        </p>
      </div>

      {/* FILTERS row */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Filters:</span>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Vehicle Type: All</option>
            <option value="Semi-Truck">Semi-Truck</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Flatbed">Flatbed</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Status: All</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Region: All</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Stat label="Active Vehicles" value={kpi.activeVehicles} />
        <Stat label="Available Vehicles" value={kpi.availableVehicles} />
        <Stat label="In Maintenance" value={String(kpi.inMaintenance).padStart(2, "0")} />
        <Stat label="Active Trips" value={kpi.activeTrips} />
        <Stat label="Pending Trips" value={String(kpi.pendingTrips).padStart(2, "0")} />
        <Stat label="Drivers On Duty" value={kpi.driversOnDuty} />
        <Stat label="Fleet Utilization" value={`${kpi.fleetUtilization}%`} accent />
      </div>

      {/* Main Layout sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-200">Recent Trips</h3>
            <p className="text-xs text-slate-500 mt-0.5">Trips dispatched or completed in this cycle</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Trip</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Driver</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {recentTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <td className="p-3.5 font-mono text-xs font-bold text-indigo-500 dark:text-indigo-400">{t.id}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 text-sm font-semibold">{t.vehicle}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 text-sm">{t.driver}</td>
                    <td className="p-3.5">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs font-mono">{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Inventory breakdown (Recharts) */}
        {canSeeAnalytics ? (
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Vehicle Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time inventory overview</p>
            </div>
            <div className="h-64 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Analytics Restricted</span>
            <p className="text-[11px] text-slate-600 mt-2">Only Fleet Managers or Financial Analysts are authorized to view inventory charts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
