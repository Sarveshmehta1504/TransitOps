"use client";

import React, { useState } from "react";
import { useVehicles } from "@/hooks/useVehicles";
import { VEHICLE_STATUSES, VEHICLE_TYPES } from "@/lib/constants";
import { VehicleStatus } from "@/types/vehicle";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Plus, X, Search, MoreVertical, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import Link from "next/link";
import { vehicleSchema } from "@/lib/validators/schemas";

export default function VehiclesPage() {
  const { vehicles, createVehicle, deleteVehicle, isCreating } = useVehicles();
  const { toast } = useToast();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState(VEHICLE_TYPES[0]);
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setRegNo("");
    setName("");
    setType(VEHICLE_TYPES[0]);
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
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Vehicle Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Maintain registry entries, mileage tracker, status audits.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by reg number or model..."
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

      {/* Grid / Table layout */}
      <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reg No</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Odometer</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Capacity (lbs)</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-slate-500">
                    No vehicles found match the filter options.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const stat = VEHICLE_STATUSES[vehicle.status];
                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-inner">
                          {vehicle.registration_number}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200 text-sm">{vehicle.name}</td>
                      <td className="p-4 text-slate-400 text-sm">{vehicle.type}</td>
                      <td className="p-4 font-mono text-slate-300 text-sm">{formatNumber(Number(vehicle.odometer))} mi</td>
                      <td className="p-4 font-mono text-slate-300 text-sm">{formatNumber(Number(vehicle.max_load_capacity))}</td>
                      <td className="p-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.color}`}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="p-2 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800 rounded-xl"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Modal dialog box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden animate-slide-in">
            {/* Top accent */}
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
              <div className="grid grid-cols-2 gap-4">
                {/* Reg Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Registration No
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. TX-992-K"
                  />
                  {errors.registration_number && (
                    <p className="text-xs text-rose-400 font-medium">{errors.registration_number}</p>
                  )}
                </div>

                {/* Model Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Kenworth T680"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-400 font-medium">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Vehicle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Capacity (lbs)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 45000"
                  />
                  {errors.max_load_capacity && (
                    <p className="text-xs text-rose-400 font-medium">{errors.max_load_capacity}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Odometer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Odometer (mi)
                  </label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 12000"
                  />
                  {errors.odometer && (
                    <p className="text-xs text-rose-400 font-medium">{errors.odometer}</p>
                  )}
                </div>

                {/* Acquisition Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Acquisition Cost ($)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. 145000"
                  />
                  {errors.acquisition_cost && (
                    <p className="text-xs text-rose-400 font-medium">{errors.acquisition_cost}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Operational Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="in_shop">In Shop / Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Submit Buttons */}
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
  );
}
