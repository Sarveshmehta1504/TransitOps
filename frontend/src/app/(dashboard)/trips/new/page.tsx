"use client";

import React, { useState } from "react";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useToast } from "@/providers/toast-provider";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { tripSchema } from "@/lib/validators/schemas";
import { parseISO, isBefore } from "date-fns";
import { RoleGate } from "@/components/layout/RoleGate";

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip, isCreating } = useTrips();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { toast } = useToast();

  // Form State
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter available vehicles and drivers
  const availableVehicles = vehicles.filter(v => v.status === "available");
  const availableDrivers = drivers.filter(d => {
    const isAvail = d.status === "available";
    const isLicenseValid = !isBefore(parseISO(d.license_expiry), new Date());
    return isAvail && isLicenseValid;
  });

  const selectedVehicle = vehicles.find(v => v.id === Number(vehicleId));
  const vehicleCapacity = selectedVehicle ? selectedVehicle.max_load_capacity : 0;
  const cargoWeight = Number(weight) || 0;
  const capacityOverload = selectedVehicle && cargoWeight > vehicleCapacity;
  const overloadDiff = cargoWeight - vehicleCapacity;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (capacityOverload) {
      setErrors({ cargo_weight: `Cargo weight exceeds vehicle capacity limit of ${vehicleCapacity} kg` });
      toast("Cargo weight overload warning", "warning");
      return;
    }

    const formData = {
      vehicle_id: Number(vehicleId),
      driver_id: Number(driverId),
      source,
      destination,
      cargo_weight: cargoWeight,
      planned_distance: Number(distance),
      status: "dispatched" as const,
      final_odometer: null,
      fuel_consumed: null,
    };

    const result = tripSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const formattedErrors: Record<string, string> = {};
      Object.keys(fieldErrors).forEach((key) => {
        formattedErrors[key] = fieldErrors[key]?.[0] || "";
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      await createTrip(formData);
      toast("Trip dispatched successfully", "success");
      router.push("/trips");
    } catch (err: any) {
      toast(err.message || "Failed to dispatch trip", "error");
    }
  };

  return (
    <RoleGate allowedRoles={["Dispatcher"]}>
      <div className="max-w-2xl mx-auto space-y-8 select-none">
        {/* Navigation */}
        <Link href="/trips" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dispatch Board</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create Trip
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Assign available drivers and vehicles to cargo routes.
          </p>
        </div>

        <div className="glass-panel border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />

          <form onSubmit={handleDispatch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Vehicle Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Available Vehicle
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Truck --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.name} (Max: {v.max_load_capacity} kg)
                    </option>
                  ))}
                </select>
                {errors.vehicle_id && <p className="text-xs text-rose-400 font-medium">{errors.vehicle_id}</p>}
              </div>

              {/* Driver Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Available Driver
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Operator --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Score: {d.safety_score}%)
                    </option>
                  ))}
                </select>
                {errors.driver_id && <p className="text-xs text-rose-400 font-medium">{errors.driver_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Source */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Yard</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Gandhinagar Depot"
                />
                {errors.source && <p className="text-xs text-rose-400 font-medium">{errors.source}</p>}
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination Hub</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Ahmedabad Hub"
                />
                {errors.destination && <p className="text-xs text-rose-400 font-medium">{errors.destination}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cargo Weight */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cargo Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 500"
                />
                {errors.cargo_weight && <p className="text-xs text-rose-400 font-medium">{errors.cargo_weight}</p>}
              </div>

              {/* Distance */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned Distance (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 35"
                />
                {errors.planned_distance && <p className="text-xs text-rose-400 font-medium">{errors.planned_distance}</p>}
              </div>
            </div>

            {/* Live Capacity Display Info Card */}
            {selectedVehicle && (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Vehicle Capacity:</span>
                  <span className="text-slate-300 font-mono">{vehicleCapacity} kg</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Cargo Weight:</span>
                  <span className="text-slate-300 font-mono">{cargoWeight} kg</span>
                </div>

                {capacityOverload && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-400 flex items-center gap-2 mt-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                    <span>Capacity exceeded by {overloadDiff} kg &mdash; dispatch blocked</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
              <Link
                href="/trips"
                className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating || capacityOverload}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50"
              >
                {capacityOverload ? "Dispatch (disabled)" : isCreating ? "Dispatching..." : "Dispatch Cargo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RoleGate>
  );
}
