"use client";

import React from "react";
import { useTrips } from "@/hooks/useTrips";
import { TRIP_STATUSES } from "@/lib/constants";
import { TripStatus } from "@/types/trip";
import { Plus, Navigation, CheckCircle2, XCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/providers/toast-provider";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";

export default function TripsPage() {
  const { trips, updateTrip } = useTrips();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { toast } = useToast();

  const handleStatusChange = async (id: number, nextStatus: TripStatus) => {
    try {
      await updateTrip({ id, data: { status: nextStatus } });
      toast(`Trip advanced to ${nextStatus}`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update trip status", "error");
    }
  };

  const columns: { status: TripStatus; label: string; bg: string; border: string }[] = [
    { status: "draft", label: "Drafts", bg: "bg-slate-950/20", border: "border-slate-800" },
    { status: "dispatched", label: "Dispatched", bg: "bg-amber-500/5", border: "border-amber-500/20" },
    { status: "completed", label: "Completed", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
    { status: "cancelled", label: "Cancelled", bg: "bg-rose-500/5", border: "border-rose-500/20" },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Trip Dispatch & Tracking
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch trucks, track cargo routes, complete delivery logs.
          </p>
        </div>
        <Link
          href="/trips/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Dispatch</span>
        </Link>
      </div>

      {/* Kanban Lifecycle Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTrips = trips.filter(t => t.status === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-2xl border p-4 flex flex-col h-[70vh] min-h-[500px] ${col.bg} ${col.border}`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                <span className="text-sm font-bold text-slate-300">{col.label}</span>
                <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-slate-400">
                  {colTrips.length}
                </span>
              </div>

              {/* Cards stack */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {colTrips.length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-slate-850/50 rounded-xl p-8 text-center">
                    <p className="text-xs text-slate-600">No trips in this stage</p>
                  </div>
                ) : (
                  colTrips.map((trip) => {
                    const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                    const driver = drivers.find(d => d.id === trip.driver_id);

                    return (
                      <div
                        key={trip.id}
                        className="glass-panel border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            TRIP #{trip.id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {trip.planned_distance} mi
                          </span>
                        </div>

                        {/* Source/Destination */}
                        <div>
                          <div className="text-xs font-semibold text-slate-200 truncate">{trip.source}</div>
                          <div className="text-[10px] text-slate-500 font-medium my-0.5">to</div>
                          <div className="text-xs font-semibold text-slate-200 truncate">{trip.destination}</div>
                        </div>

                        {/* Assigned Vehicle & Operator */}
                        <div className="border-t border-slate-900 pt-2 flex flex-col gap-1 text-[11px] text-slate-400">
                          <div>
                            <span className="text-slate-500">Truck:</span>{" "}
                            <span className="font-semibold text-slate-300 truncate inline-block max-w-[120px]">
                              {vehicle ? vehicle.name : `ID ${trip.vehicle_id}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Driver:</span>{" "}
                            <span className="font-semibold text-slate-300 truncate inline-block max-w-[120px]">
                              {driver ? driver.name : `ID ${trip.driver_id}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Cargo:</span>{" "}
                            <span className="font-semibold text-slate-300">{trip.cargo_weight} lbs</span>
                          </div>
                        </div>

                        {/* Interactive Status Changers */}
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
                                className="flex-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Cancel</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(trip.id, "completed")}
                                className="flex-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Complete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
