"use client";

import React, { useState } from "react";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";
import {
  Truck,
  Users,
  Compass,
  Wrench,
  Percent,
  TrendingUp,
  MapPin,
  Filter,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const { vehicles, isLoading: loadingVehicles } = useVehicles();
  const { drivers, isLoading: loadingDrivers } = useDrivers();
  const { trips, isLoading: loadingTrips } = useTrips();

  // Filters State
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");

  if (loadingVehicles || loadingDrivers || loadingTrips) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-900 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-slate-900 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900 animate-pulse rounded-2xl" />
          <div className="h-96 bg-slate-900 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredVehicles = vehicles.filter((v) => {
    if (vehicleTypeFilter !== "All" && v.type !== vehicleTypeFilter) return false;
    return true;
  });

  // Calculate Metrics
  const totalVehiclesCount = filteredVehicles.length;
  const availableVehiclesCount = filteredVehicles.filter(v => v.status === "available").length;
  const inShopVehiclesCount = filteredVehicles.filter(v => v.status === "in_shop").length;
  const activeVehiclesCount = filteredVehicles.filter(v => v.status === "on_trip").length;

  const totalDriversCount = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === "on_trip").length;
  
  const pendingTripsCount = trips.filter(t => t.status === "dispatched").length;
  const activeTripsCount = trips.filter(t => t.status === "dispatched").length;

  // Fleet Utilization (%) = (Active Vehicles / Total Vehicles) * 100
  const utilization = totalVehiclesCount > 0 ? (activeVehiclesCount / totalVehiclesCount) * 100 : 0;

  // Recharts Chart 1: Utilization Trend Data (Weekly Mock Data)
  const utilizationTrend = [
    { day: "Mon", rate: 58 },
    { day: "Tue", rate: 64 },
    { day: "Wed", rate: 75 },
    { day: "Thu", rate: utilization > 0 ? Math.round(utilization) : 60 },
    { day: "Fri", rate: 70 },
    { day: "Sat", rate: 45 },
    { day: "Sun", rate: 38 },
  ];

  // Recharts Chart 2: Status Breakdown
  const statusBreakdown = [
    { name: "Available", value: availableVehiclesCount, color: "#10b981" },
    { name: "On Trip", value: activeVehiclesCount, color: "#3b82f6" },
    { name: "In Shop", value: inShopVehiclesCount, color: "#f59e0b" },
    { name: "Retired", value: filteredVehicles.filter(v => v.status === "retired").length, color: "#64748b" },
  ];

  const vehicleTypes = Array.from(new Set(vehicles.map((v) => v.type)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Operations Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time fleet utilization, driver assignments, and vehicle logistics logs.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 px-2 text-xs font-semibold uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Vehicle Type Filter */}
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Types</option>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fleet Utilization */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fleet Utilization
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {utilization.toFixed(1)}%
            </h3>
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Vehicles
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {activeVehiclesCount} / {totalVehiclesCount}
            </h3>
          </div>
        </div>

        {/* Drivers On Duty */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Drivers On Duty
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {activeDriversCount} / {totalDriversCount}
            </h3>
          </div>
        </div>

        {/* Active Trips */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active / Dispatch Trips
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {activeTripsCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Line Chart */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Utilization Rate</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average weekly vehicle scheduling efficiency</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+4.2% this week</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Breakdown */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Vehicle Inventory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time breakdown of current statuses</p>
          </div>
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
