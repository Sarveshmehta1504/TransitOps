"use client";

import React, { use } from "react";
import { useVehicle } from "@/hooks/useVehicles";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useFuelExpenses } from "@/hooks/useFuelExpenses";
import { useTrips } from "@/hooks/useTrips";
import { VEHICLE_STATUSES } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowLeft, Clock, MapPin, Wrench, Fuel, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const vehicleId = parseInt(resolvedParams.id);
  
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const { logs: maintenanceLogs } = useMaintenance();
  const { fuelLogs, expenses } = useFuelExpenses();
  const { trips } = useTrips();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-900 animate-pulse rounded-lg" />
        <div className="h-40 bg-slate-900 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-60 bg-slate-900 animate-pulse rounded-2xl col-span-2" />
          <div className="h-60 bg-slate-900 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">Vehicle not found</h3>
        <p className="text-sm text-slate-400 mt-1 mb-6">The vehicle entry does not exist or was deleted.</p>
        <Link href="/vehicles" className="text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl transition-colors">
          Back to Registry
        </Link>
      </div>
    );
  }

  // Filter logs for this vehicle
  const vehicleMaint = maintenanceLogs.filter(m => m.vehicle_id === vehicle.id);
  const vehicleFuel = fuelLogs.filter(f => f.vehicle_id === vehicle.id);
  const vehicleExpenses = expenses.filter(e => e.vehicle_id === vehicle.id);
  const vehicleTrips = trips.filter(t => t.vehicle_id === vehicle.id);

  // Aggregates
  const totalMaintCost = vehicleMaint.reduce((sum, m) => sum + m.cost, 0);
  const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
  const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
  const totalExpenseCost = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOpCost = totalMaintCost + totalFuelCost + totalExpenseCost;

  const stat = VEHICLE_STATUSES[vehicle.status];

  return (
    <div className="space-y-8 select-none">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <Link href="/vehicles" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Registry</span>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {vehicle.name}
            </h1>
            <span className="font-mono text-sm font-bold bg-slate-900 text-indigo-400 px-3 py-1 rounded-xl border border-slate-800">
              {vehicle.registration_number}
            </span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${stat.color}`}>
            {stat.label}
          </span>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Specs */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
            Specifications
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="text-slate-200 font-semibold">{vehicle.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Capacity</span>
              <span className="text-slate-200 font-semibold font-mono">{formatNumber(Number(vehicle.max_load_capacity))} lbs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Odometer</span>
              <span className="text-slate-200 font-semibold font-mono">{formatNumber(Number(vehicle.odometer))} mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Acquisition Cost</span>
              <span className="text-slate-200 font-semibold font-mono">{formatCurrency(Number(vehicle.acquisition_cost))}</span>
            </div>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
            Financial Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Maintenance</span>
              <span className="text-amber-400 font-semibold font-mono">{formatCurrency(totalMaintCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fuel log Cost</span>
              <span className="text-blue-400 font-semibold font-mono">{formatCurrency(totalFuelCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expenses</span>
              <span className="text-slate-300 font-semibold font-mono">{formatCurrency(totalExpenseCost)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-850 pt-2 font-bold">
              <span className="text-slate-400">Total Op Cost</span>
              <span className="text-slate-100 font-mono">{formatCurrency(totalOpCost)}</span>
            </div>
          </div>
        </div>

        {/* Operational Statistics */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
            Usage Statistics
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Trips</span>
              <span className="text-slate-200 font-semibold font-mono">{vehicleTrips.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fuel Consumed</span>
              <span className="text-slate-200 font-semibold font-mono">{formatNumber(totalFuelLiters)} L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Efficiency</span>
              <span className="text-emerald-400 font-semibold font-mono">
                {totalFuelLiters > 0 ? (vehicle.odometer / totalFuelLiters).toFixed(2) : 0} mi/L
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trips and logs detailed logs split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Logs */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="h-4.5 w-4.5 text-amber-500" />
              <span>Maintenance Records ({vehicleMaint.length})</span>
            </h3>
            <Link href="/maintenance" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Log New</Link>
          </div>
          {vehicleMaint.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No maintenance logs recorded for this vehicle.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {vehicleMaint.map(m => (
                <div key={m.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{m.start_date} {m.active ? " (In Shop)" : ""}</p>
                  </div>
                  <span className="font-mono text-sm text-amber-400 font-bold">{formatCurrency(m.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trips logs */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-indigo-500" />
              <span>Trips History ({vehicleTrips.length})</span>
            </h3>
            <Link href="/trips/new" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Dispatch New</Link>
          </div>
          {vehicleTrips.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No trips recorded for this vehicle.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {vehicleTrips.map(t => (
                <div key={t.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>{t.source}</span>
                      <span className="text-slate-600">→</span>
                      <span>{t.destination}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.planned_distance} mi • Status: <span className="font-semibold capitalize text-slate-400">{t.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
