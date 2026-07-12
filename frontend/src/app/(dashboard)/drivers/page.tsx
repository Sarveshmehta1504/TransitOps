"use client";

import React, { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { DRIVER_STATUSES } from "@/lib/constants";
import { DriverStatus } from "@/types/driver";
import { Plus, X, Search, MoreVertical, ShieldAlert, CheckCircle2, UserX } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import Link from "next/link";
import { driverSchema } from "@/lib/validators/schemas";
import { differenceInDays, parseISO, isBefore } from "date-fns";

export default function DriversPage() {
  const { drivers, createDriver, deleteDriver, isCreating } = useDrivers();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseCat, setLicenseCat] = useState("Class A CDL");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");
  const [status, setStatus] = useState<DriverStatus>("available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setName("");
    setLicenseNo("");
    setLicenseCat("Class A CDL");
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

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver(id);
        toast("Driver record deleted successfully", "success");
      } catch (err: any) {
        toast(err.message || "Failed to delete driver", "error");
      }
    }
  };

  const getLicenseBadge = (expiryStr: string) => {
    const today = new Date();
    const expiry = parseISO(expiryStr);
    
    if (isBefore(expiry, today)) {
      return { label: "Expired", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    
    const daysLeft = differenceInDays(expiry, today);
    if (daysLeft < 30) {
      return { label: `Expiring soon (${daysLeft}d)`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    
    return { label: "Active", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-amber-400";
    return "text-rose-400 animate-pulse";
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Driver Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit compliance, safety scores, active duty logs.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Filters */}
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

      {/* Grid List */}
      <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Driver</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">License Number</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">License Class</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">License Expiry</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Safety Score</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-slate-500">
                    No drivers found match the criteria.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const stat = DRIVER_STATUSES[driver.status];
                  const licBadge = getLicenseBadge(driver.license_expiry);

                  return (
                    <tr key={driver.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{driver.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{driver.contact_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold bg-slate-900 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800">
                          {driver.license_number}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{driver.license_category}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-300 font-mono text-xs">{driver.license_expiry}</span>
                          <span className={`text-[10px] w-fit font-bold uppercase px-1.5 py-0.5 rounded border ${licBadge.color}`}>
                            {licBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-mono font-bold text-sm ${getSafetyScoreColor(driver.safety_score)}`}>
                          {driver.safety_score} / 100
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.color}`}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded-xl"
                          >
                            <UserX className="h-4 w-4" />
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
              {/* Name */}
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
                {/* License Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Number</label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. DL-CA90210"
                  />
                  {errors.license_number && <p className="text-xs text-rose-400 font-medium">{errors.license_number}</p>}
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Class</label>
                  <select
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Class A CDL">Class A CDL</option>
                    <option value="Class B CDL">Class B CDL</option>
                    <option value="Standard Driver License">Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contact */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="+1 (415) 555-0142"
                  />
                  {errors.contact_number && <p className="text-xs text-rose-400 font-medium">{errors.contact_number}</p>}
                </div>

                {/* Expiry */}
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
                {/* Safety Score */}
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

                {/* Status */}
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
  );
}
