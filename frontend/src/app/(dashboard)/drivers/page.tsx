"use client";

import React, { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { DRIVER_STATUSES } from "@/lib/constants";
import { DriverStatus } from "@/types/driver";
import { Plus, X, Search, Info, ShieldAlert } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { driverSchema } from "@/lib/validators/schemas";
import { differenceInDays, parseISO, isBefore } from "date-fns";
import { useAuthContext } from "@/providers/auth-provider";
import { RoleGate } from "@/components/layout/RoleGate";

export default function DriversPage() {
  const { drivers, createDriver, updateDriver, deleteDriver, isCreating } = useDrivers();
  const { toast } = useToast();
  const { role } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseCat, setLicenseCat] = useState("LMV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");
  const [status, setStatus] = useState<DriverStatus>("available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSafetyOrManager = role === "Safety Officer" || role === "Fleet Manager";

  const handleOpenModal = () => {
    setName("");
    setLicenseNo("");
    setLicenseCat("LMV");
    setLicenseExpiry("");
    setContact("");
    setSafetyScore("100");
    setStatus("available");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      license_number: licenseNo,
      license_category: licenseCat,
      license_expiry: licenseExpiry,
      contact_number: contact,
      safety_score: Number(safetyScore),
      status,
    };

    const result = driverSchema.safeParse(formData);
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
      await createDriver(formData);
      toast("Driver registered successfully", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to register driver", "error");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: DriverStatus, newStatus: DriverStatus) => {
    if (!isSafetyOrManager) return;
    try {
      await updateDriver({ id, data: { status: newStatus } });
      toast(`Driver status updated to ${newStatus}`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update driver status", "error");
    }
  };

  const getLicenseBadge = (expiryStr: string) => {
    const today = new Date();
    let expiryDate;
    try {
      expiryDate = parseISO(expiryStr);
    } catch {
      return { label: "Active", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    }
    
    if (isBefore(expiryDate, today)) {
      return { label: `${expiryStr} EXPIRED`, color: "text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold" };
    }
    
    const daysLeft = differenceInDays(expiryDate, today);
    if (daysLeft < 30) {
      return { label: `${expiryStr} Expiring soon (${daysLeft}d)`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    
    return { label: expiryStr, color: "text-slate-300 bg-slate-500/5 border-slate-800" };
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGate allowedRoles={["Fleet Manager", "Safety Officer"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Drivers
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Audit compliance, safety scores, active duty logs.
            </p>
          </div>
          {isSafetyOrManager && (
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Driver</span>
            </button>
          )}
        </div>

        {/* Rule Banner */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-normal">
            <span className="font-semibold text-slate-200">System Rule:</span> Expired license or Suspended status will block drivers from any trip assignments.
          </p>
        </div>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or license..."
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
            {Object.entries(DRIVER_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table list */}
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Driver</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">License No.</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Expiry</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Trip Compl.</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Safety</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  {isSafetyOrManager && <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Toggle Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-sm text-slate-500">
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const licBadge = getLicenseBadge(driver.license_expiry);
                    const stat = DRIVER_STATUSES[driver.status] || { label: driver.status, color: "text-slate-400" };

                    return (
                      <tr key={driver.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                              {driver.name.charAt(0)}
                            </div>
                            <div className="font-semibold text-slate-200 text-sm">{driver.name}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800">
                            {driver.license_number}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{driver.license_category}</td>
                        <td className="p-4">
                          <span className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border ${licBadge.color}`}>
                            {licBadge.label}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm font-mono">{driver.contact_number}</td>
                        <td className="p-4 text-slate-300 font-mono text-sm">96%</td>
                        <td className="p-4">
                          <span className={`font-mono font-bold text-sm ${driver.safety_score >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                            {driver.safety_score}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.color}`}>
                            {stat.label}
                          </span>
                        </td>
                        {isSafetyOrManager && (
                          <td className="p-4 text-right">
                            <select
                              value={driver.status}
                              onChange={(e) => handleToggleStatus(driver.id, driver.status, e.target.value as DriverStatus)}
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="available">Available</option>
                              <option value="on_trip">On Trip</option>
                              <option value="off_duty">Off Duty</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                        )}
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
            
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden animate-slide-in">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">Add Operator / Driver</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDriver} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Driver Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="Elena Rostova"
                  />
                  {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Number</label>
                    <input
                      type="text"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. DL-44120"
                    />
                    {errors.license_number && <p className="text-xs text-rose-400 font-medium">{errors.license_number}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Class</label>
                    <select
                      value={licenseCat}
                      onChange={(e) => setLicenseCat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    >
                      <option value="LMV">LMV</option>
                      <option value="HMV">HMV</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Number</label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      placeholder="98765xxxxx"
                    />
                    {errors.contact_number && <p className="text-xs text-rose-400 font-medium">{errors.contact_number}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Expiry</label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    {errors.license_expiry && <p className="text-xs text-rose-400 font-medium">{errors.license_expiry}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safety Score (0-100)</label>
                    <input
                      type="number"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      min="0"
                      max="100"
                    />
                    {errors.safety_score && <p className="text-xs text-rose-400 font-medium">{errors.safety_score}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duty Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as DriverStatus)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="off_duty">Off Duty</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
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
                    {isCreating ? "Adding..." : "Add Driver"}
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
