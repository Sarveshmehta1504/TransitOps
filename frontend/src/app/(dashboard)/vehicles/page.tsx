"use client";

import React, { useState } from "react";
import { useVehicles } from "@/hooks/useVehicles";
import { VEHICLE_STATUSES } from "@/lib/constants";
import { VehicleStatus } from "@/types/vehicle";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Plus, X, Search, Eye, Trash2, ShieldAlert, Info } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import Link from "next/link";
import { vehicleSchema } from "@/lib/validators/schemas";
import { useAuthContext } from "@/providers/auth-provider";
import { RoleGate } from "@/components/layout/RoleGate";

export default function VehiclesPage() {
  const { vehicles, createVehicle, deleteVehicle, isCreating } = useVehicles();
  const { toast } = useToast();
  const { role } = useAuthContext();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Van");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFleetManager = role === "Fleet Manager";

  const handleOpenModal = () => {
    setRegNo("");
    setName("");
    setType("Van");
    setCapacity("");
    setOdometer("");
    setCost("");
    setStatus("available");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check unique regNo client-side
    const duplicate = vehicles.some(v => v.registration_number.toLowerCase() === regNo.trim().toLowerCase());
    if (duplicate) {
      setErrors({ registration_number: "Registration number must be unique." });
      toast("Validation failed: Registration number already exists", "error");
      return;
    }

    const formData = {
      registration_number: regNo,
      name,
      type,
      max_load_capacity: Number(capacity),
      odometer: Number(odometer),
      acquisition_cost: Number(cost),
      status,
    };

    const result = vehicleSchema.safeParse(formData);
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
      await createVehicle(formData);
      toast("Vehicle registered successfully", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to register vehicle", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(id);
        toast("Vehicle deleted successfully", "success");
      } catch (err: any) {
        toast(err.message || "Failed to delete vehicle", "error");
      }
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGate allowedRoles={["Fleet Manager", "Dispatcher", "Financial Analyst"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Fleet
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Maintain registry entries, mileage tracker, status audits.
            </p>
          </div>
          {isFleetManager && (
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>

        {/* Rule Banner */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-normal">
            <span className="font-semibold text-slate-200">System Rule:</span> Registration No. must be unique. Retired or In Shop vehicles are automatically hidden from the Trip Dispatcher.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search reg. no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 w-full placeholder-slate-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            {Object.entries(VEHICLE_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table Layout */}
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reg. No.</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name/Model</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Capacity</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Odometer</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Acq. Cost</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-sm text-slate-500">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const stat = VEHICLE_STATUSES[vehicle.status] || { label: vehicle.status, color: "text-slate-400" };
                    return (
                      <tr key={vehicle.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-inner">
                            {vehicle.registration_number}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-200 text-sm">{vehicle.name}</td>
                        <td className="p-4 text-slate-400 text-sm">{vehicle.type}</td>
                        <td className="p-4 font-mono text-slate-300 text-sm">
                          {vehicle.max_load_capacity >= 1000 
                            ? `${(vehicle.max_load_capacity / 1000).toFixed(0)} Ton` 
                            : `${vehicle.max_load_capacity} kg`}
                        </td>
                        <td className="p-4 font-mono text-slate-300 text-sm">{formatNumber(Number(vehicle.odometer))} km</td>
                        <td className="p-4 font-mono text-slate-300 text-sm">{formatCurrency(Number(vehicle.acquisition_cost))}</td>
                        <td className="p-4">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.color}`}>
                            {stat.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/vehicles/${vehicle.id}`}
                              className="p-2 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-850 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {isFleetManager && (
                              <button
                                onClick={() => handleDelete(vehicle.id)}
                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded-xl"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative overflow-y-auto max-h-[90dvh] animate-slide-in">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">Add Fleet Vehicle</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVehicle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reg No */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration No</label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. GJ01AB4521"
                    />
                    {errors.registration_number && (
                      <p className="text-xs text-rose-400 font-medium">{errors.registration_number}</p>
                    )}
                  </div>

                  {/* Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. VAN-05"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-400 font-medium">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini">Mini</option>
                      <option value="Flatbed">Flatbed</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capacity (kg)</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 500"
                    />
                    {errors.max_load_capacity && (
                      <p className="text-xs text-rose-400 font-medium">{errors.max_load_capacity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Odometer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Odometer (km)</label>
                    <input
                      type="number"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 74000"
                    />
                    {errors.odometer && (
                      <p className="text-xs text-rose-400 font-medium">{errors.odometer}</p>
                    )}
                  </div>

                  {/* Cost */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acquisition Cost (Rs)</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 620000"
                    />
                    {errors.acquisition_cost && (
                      <p className="text-xs text-rose-400 font-medium">{errors.acquisition_cost}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="in_shop">In Shop</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
                  >
                    {isCreating ? "Adding..." : "Add Vehicle"}
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
