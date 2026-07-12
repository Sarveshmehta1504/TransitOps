"use client";

import React, { useState } from "react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { useToast } from "@/providers/toast-provider";
import { formatCurrency } from "@/lib/utils";
import { Plus, X, Info, ArrowRightLeft } from "lucide-react";
import { maintenanceSchema } from "@/lib/validators/schemas";
import { RoleGate } from "@/components/layout/RoleGate";

export default function MaintenancePage() {
  const { logs, createLog, isCreating } = useMaintenance();
  const { vehicles } = useVehicles();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setVehicleId("");
    setTitle("");
    setCost("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setStatus("Active");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      vehicle_id: Number(vehicleId),
      title,
      description: null,
      cost: Number(cost),
      start_date: startDate,
      end_date: null,
      active: status === "Active",
    };

    const result = maintenanceSchema.safeParse(formData);
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
      await createLog(formData);
      toast("Maintenance record logged successfully", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to log maintenance record", "error");
    }
  };

  // Filter vehicles that can go into maintenance
  const activeVehicles = vehicles.filter(v => v.status !== "retired");

  return (
    <RoleGate allowedRoles={["Fleet Manager"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Maintenance
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track repairs, scheduled maintenance, and vehicle downtime costs.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Log Service</span>
          </button>
        </div>

        {/* Visual Flow Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Automated Status Flow:</span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                <span className="text-slate-400">Available</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-amber-400 font-bold">In Shop</span>
              </div>
              <ArrowRightLeft className="h-4 w-4 text-slate-650" />
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                <span className="text-amber-400 font-bold">In Shop</span>
                <span className="text-slate-600">&rarr;</span>
                <span className="text-emerald-400 font-bold">Available</span>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
            <Info className="h-5 w-5 text-indigo-400 shrink-0" />
            <p className="text-xs text-slate-450 leading-normal">
              Note: In Shop vehicles are automatically removed from the dispatch pool.
            </p>
          </div>
        </div>

        {/* Table logs */}
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Service</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Cost</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-sm text-slate-500">
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                    return (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800">
                            {vehicle ? vehicle.registration_number : `ID ${log.vehicle_id}`}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-200 text-sm">{log.title}</td>
                        <td className="p-4 font-mono text-amber-400 font-bold text-sm">{formatCurrency(log.cost)}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            log.active 
                              ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                              : "text-slate-400 bg-slate-500/10 border-slate-500/20"
                          }`}>
                            {log.active ? "In Shop" : "Completed"}
                          </span>
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
                <h2 className="text-xl font-bold text-slate-100">Log Service Record</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-4">
                {/* Vehicle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Truck --</option>
                    {activeVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name}
                      </option>
                    ))}
                  </select>
                  {errors.vehicle_id && <p className="text-xs text-rose-400 font-medium">{errors.vehicle_id}</p>}
                </div>

                {/* Service Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Type</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Oil Change"
                  />
                  {errors.title && <p className="text-xs text-rose-400 font-medium">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cost */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost (Rs)</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 2500"
                    />
                    {errors.cost && <p className="text-xs text-rose-400 font-medium">{errors.cost}</p>}
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    {errors.start_date && <p className="text-xs text-rose-400 font-medium">{errors.start_date}</p>}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active (In Shop)</option>
                    <option value="Completed">Completed (Available)</option>
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
                    {isCreating ? "Saving..." : "Save"}
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
