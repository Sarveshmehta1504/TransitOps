"use client";

import React, { useState } from "react";
import { useTrips } from "@/hooks/useTrips";
import { TripStatus, Trip } from "@/types/trip";
import { Plus, Compass, CheckCircle2, XCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/providers/toast-provider";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useAuthContext } from "@/providers/auth-provider";
import { RoleGate } from "@/components/layout/RoleGate";

export default function TripsPage() {
  const { trips, updateTrip } = useTrips();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { toast } = useToast();
  const { role } = useAuthContext();

  const isDispatcher = role === "Dispatcher";

  // Completion Dialog States
  const [completeTripId, setCompleteTripId] = useState<number | null>(null);
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStatusChange = async (id: number, nextStatus: TripStatus) => {
    if (!isDispatcher) return;
    try {
      await updateTrip({ id, data: { status: nextStatus } });
      toast(`Trip advanced to ${nextStatus}`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update trip status", "error");
    }
  };

  const handleOpenCompleteModal = (id: number) => {
    setCompleteTripId(id);
    setFinalOdometer("");
    setFuelConsumed("");
    setErrors({});
  };

  const handleSaveCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTripId) return;

    if (!finalOdometer || isNaN(Number(finalOdometer)) || Number(finalOdometer) <= 0) {
      setErrors({ final_odometer: "Must specify a valid odometer reading." });
      return;
    }
    if (!fuelConsumed || isNaN(Number(fuelConsumed)) || Number(fuelConsumed) <= 0) {
      setErrors({ fuel_consumed: "Must specify valid fuel consumption." });
      return;
    }

    try {
      await updateTrip({
        id: completeTripId,
        data: {
          status: "completed",
          final_odometer: Number(finalOdometer),
          fuel_consumed: Number(fuelConsumed),
        },
      });
      toast("Trip completed successfully", "success");
      setCompleteTripId(null);
    } catch (err: any) {
      toast(err.message || "Failed to complete trip", "error");
    }
  };

  const columns: { status: TripStatus; label: string; bg: string; border: string }[] = [
    { status: "draft", label: "Draft", bg: "bg-slate-950/20", border: "border-slate-800" },
    { status: "dispatched", label: "Dispatched", bg: "bg-amber-500/5", border: "border-amber-500/20" },
    { status: "completed", label: "Completed", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
    { status: "cancelled", label: "Cancelled", bg: "bg-rose-500/5", border: "border-rose-500/20" },
  ];

  return (
    <RoleGate allowedRoles={["Dispatcher", "Safety Officer"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Trips
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Dispatch trucks, track cargo routes, complete delivery logs.
            </p>
          </div>
          {isDispatcher && (
            <Link
              href="/trips/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>New Dispatch</span>
            </Link>
          )}
        </div>

        {/* TRIP LIFECYCLE Visual Stepper */}
        <div className="glass-panel border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-2 max-w-lg">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Trip Lifecycle:</span>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="text-indigo-400 font-bold">Draft</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-amber-400 font-bold">Dispatched</span>
            <span className="text-slate-600">&rarr;</span>
            <span className="text-emerald-400 font-bold">Completed</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-bold">Cancelled</span>
          </div>
        </div>

        {/* Live Board Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colTrips = trips.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className={`rounded-2xl border p-4 flex flex-col h-[70vh] min-h-[500px] ${col.bg} ${col.border}`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{col.label}</span>
                  <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-slate-400">
                    {colTrips.length}
                  </span>
                </div>

                {/* Cards stack */}
                <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                  {colTrips.length === 0 ? (
                    <div className="h-full flex items-center justify-center border border-dashed border-slate-850/50 rounded-xl p-8 text-center">
                      <p className="text-[11px] text-slate-600">No active items in this phase</p>
                    </div>
                  ) : (
                    colTrips.map((trip) => {
                      const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
                      const driver = drivers.find((d) => d.id === trip.driver_id);

                      return (
                        <div
                          key={trip.id}
                          className="glass-panel border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              TR{String(trip.id).padStart(3, "0")}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {trip.planned_distance} km
                            </span>
                          </div>

                          {/* Source/Destination */}
                          <div className="text-xs font-medium text-slate-300">
                            <div className="truncate font-semibold text-slate-200">{trip.source}</div>
                            <div className="text-[10px] text-slate-500 font-mono my-0.5">&rarr;</div>
                            <div className="truncate font-semibold text-slate-200">{trip.destination}</div>
                          </div>

                          {/* Assignment stats */}
                          <div className="border-t border-slate-900 pt-2 flex flex-col gap-1 text-[11px] text-slate-400">
                            <div>
                              <span className="text-slate-500 font-semibold">Vehicle:</span>{" "}
                              <span className="text-slate-300 font-mono font-bold">
                                {vehicle ? vehicle.registration_number : `ID ${trip.vehicle_id}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold">Driver:</span>{" "}
                              <span className="text-slate-300 font-semibold">
                                {driver ? driver.name : `ID ${trip.driver_id}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold">Cargo:</span>{" "}
                              <span className="text-slate-300 font-mono">{trip.cargo_weight} kg</span>
                            </div>
                          </div>

                          {/* Action Hooks */}
                          {isDispatcher && (
                            <div className="border-t border-slate-900 pt-2 flex items-center justify-end gap-1.5">
                              {trip.status === "draft" && (
                                <button
                                  onClick={() => handleStatusChange(trip.id, "dispatched")}
                                  className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Dispatch</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                              {trip.status === "dispatched" && (
                                <div className="flex gap-1.5 w-full">
                                  <button
                                    onClick={() => handleStatusChange(trip.id, "cancelled")}
                                    className="flex-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1.5 rounded-lg border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Cancel</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenCompleteModal(trip.id)}
                                    className="flex-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded-lg border border-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Complete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Footer Note */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">
          <span className="font-semibold text-slate-400">On Complete:</span> final odometer reading and fuel log inputs are requested. The vehicle and driver are then transitioned back to Available.
        </div>

        {/* Complete Trip Dialog */}
        {completeTripId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setCompleteTripId(null)} />
            
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-y-auto max-h-[90dvh] animate-slide-in">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-100">Complete Delivery Log</h2>
                <button onClick={() => setCompleteTripId(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCompletion} className="space-y-4">
                {/* Final Odometer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Final Odometer Reading (km)</label>
                  <input
                    type="number"
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 74350"
                  />
                  {errors.final_odometer && <p className="text-xs text-rose-400 font-medium">{errors.final_odometer}</p>}
                </div>

                {/* Fuel Consumed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 42"
                  />
                  {errors.fuel_consumed && <p className="text-xs text-rose-400 font-medium">{errors.fuel_consumed}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setCompleteTripId(null)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
                  >
                    Save Completion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  );
}
