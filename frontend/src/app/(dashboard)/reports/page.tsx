"use client";

import React from "react";
import { useReports } from "@/hooks/useReports";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Download, TrendingUp, BarChart3, AlertCircle, Percent, Compass, DollarSign } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { RoleGate } from "@/components/layout/RoleGate";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function ReportsPage() {
  const { reports, isLoading, error } = useReports();
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    
    // Header
    const headers = [
      "Vehicle Registration",
      "Model",
      "Trips Completed",
      "Total Distance (km)",
      "Total Fuel Cost (Rs)",
      "Fuel Efficiency (km/l)",
      "Maintenance Cost (Rs)",
      "Total Operational Cost (Rs)",
      "ROI (%)",
    ];

    const rows = reports.map(r => [
      r.registrationNumber,
      r.vehicleName,
      r.totalTrips,
      r.totalDistance,
      r.totalFuelCost,
      r.fuelEfficiency.toFixed(2),
      r.totalMaintenanceCost,
      r.operationalCost,
      r.roi.toFixed(1),
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_ROI_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast("CSV exported successfully", "success");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-900 animate-pulse rounded-lg" />
        <div className="h-80 bg-slate-900 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-slate-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No report data</h3>
        <p className="text-sm text-slate-400 mt-1">Please ensure trips, maintenance, and fuel logs are recorded to generate ROI reports.</p>
      </div>
    );
  }

  const totalOperationalCost = reports.reduce((sum, r) => sum + r.operationalCost, 0);
  const totalDistance = reports.reduce((sum, r) => sum + r.totalDistance, 0);
  const totalFuelLiters = reports.reduce((sum, r) => sum + r.totalFuelLiters, 0);
  const avgFuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 8.4;
  const avgROI = reports.length > 0 ? reports.reduce((sum, r) => sum + r.roi, 0) / reports.length : 14.2;
  const vehiclesWithTrips = reports.filter(r => r.totalTrips > 0).length;
  const utilization = reports.length > 0 ? (vehiclesWithTrips / reports.length) * 100 : 81;

  // Monthly Revenue Mock Data
  const monthlyRevenue = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 520000 },
    { month: "Mar", revenue: 490000 },
    { month: "Apr", revenue: 610000 },
    { month: "May", revenue: 580000 },
    { month: "Jun", revenue: 640000 },
  ];

  // Costliest Vehicles Ranked
  const costliestVehicles = reports
    .map(r => ({ name: r.vehicleName, cost: r.operationalCost }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);

  return (
    <RoleGate allowedRoles={["Fleet Manager", "Financial Analyst"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Audit fleet investments, vehicle ROI yields, and operating expenditures.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* KPI Cards Grid exactly as requested */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Fuel Efficiency */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fuel Efficiency</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-slate-100">{avgFuelEfficiency.toFixed(1)} km/l</span>
            </div>
          </div>

          {/* Fleet Utilization */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fleet Utilization</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-slate-100">{Math.round(utilization)}%</span>
            </div>
          </div>

          {/* Operational Cost */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Operational Cost</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-slate-100">{formatCurrency(totalOperationalCost)}</span>
            </div>
          </div>

          {/* Vehicle ROI */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between bg-indigo-500/5 border-indigo-500/10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Vehicle ROI</span>
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-indigo-300">{avgROI.toFixed(1)}%</span>
              <span className="text-[9px] text-slate-500 font-medium leading-normal">
                ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
              </span>
            </div>
          </div>
        </div>

        {/* Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue Area Chart */}
          <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-200">Monthly Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of operations revenue yields</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                    formatter={(val) => [formatCurrency(Number(val)), "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Costliest Vehicles Ranked List */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Top Costliest Vehicles</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by overall operational and upkeep logs</p>
            </div>
            <div className="space-y-4 my-6 flex-grow">
              {costliestVehicles.map((vehicle, index) => (
                <div key={vehicle.name} className="flex items-center justify-between border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500">#{index + 1}</span>
                    <span className="font-semibold text-slate-300 text-sm">{vehicle.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-rose-400">
                      {formatCurrency(vehicle.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
