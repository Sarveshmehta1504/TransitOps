"use client";

import React from "react";
import { useReports } from "@/hooks/useReports";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Download, BarChart3, TrendingUp, AlertCircle, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
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
      "Total Distance (mi)",
      "Total Fuel Cost ($)",
      "Fuel Efficiency (mi/L)",
      "Maintenance Cost ($)",
      "Total Operational Cost ($)",
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

  // Find best performing vehicle by ROI
  const bestPerforming = [...reports].sort((a, b) => b.roi - a.roi)[0];

  // Recharts Chart Data (Bar graph of ROI per vehicle)
  const chartData = reports.map(r => ({
    name: r.registrationNumber,
    roi: Math.max(0, Math.round(r.roi)),
  }));

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Financial Analytics & ROI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit fleet investments, vehicle ROI yields, and operating expenditures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Highlights summary */}
      {bestPerforming && (
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Top Performing Asset</h4>
              <p className="text-xs text-slate-500 mt-0.5">Based on calculated Return on Investment (ROI)</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              {bestPerforming.registrationNumber}
            </span>
            <span className="text-emerald-400 font-bold font-mono text-lg ml-3">
              +{bestPerforming.roi.toFixed(1)}% ROI
            </span>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Distribution Chart */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-200">Asset Yield (ROI %)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated ROI percentage across active fleet assets</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  formatter={(val) => [`${val}%`, "ROI"]}
                />
                <Bar dataKey="roi" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi > 50 ? "#10b981" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Grid Table */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Operational Margins</h3>
            <p className="text-xs text-slate-500 mt-0.5">Asset ROI breakdowns</p>
          </div>
          <div className="space-y-4 my-6 flex-grow overflow-y-auto max-h-[300px]">
            {reports.map((report) => (
              <div key={report.vehicleId} className="flex items-center justify-between border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">{report.vehicleName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ops Cost: <span className="font-mono text-slate-400">{formatCurrency(report.operationalCost)}</span></p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold font-mono ${report.roi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {report.roi.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{report.fuelEfficiency.toFixed(2)} mi/L</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
