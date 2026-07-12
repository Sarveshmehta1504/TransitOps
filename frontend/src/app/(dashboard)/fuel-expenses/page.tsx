"use client";

import React, { useState } from "react";
import { useFuelExpenses } from "@/hooks/useFuelExpenses";
import { useVehicles } from "@/hooks/useVehicles";
import { useToast } from "@/providers/toast-provider";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Fuel, DollarSign, Plus, X, Receipt, Calculator } from "lucide-react";
import { fuelLogSchema, expenseSchema } from "@/lib/validators/schemas";
import { RoleGate } from "@/components/layout/RoleGate";
import { useMaintenance } from "@/hooks/useMaintenance";

export default function FuelExpensesPage() {
  const { fuelLogs, expenses, createFuelLog, createExpense, isCreatingFuel, isCreatingExpense } = useFuelExpenses();
  const { vehicles } = useVehicles();
  const { logs: maintenanceLogs } = useMaintenance();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"fuel" | "expenses">("fuel");
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [fuelErrors, setFuelErrors] = useState<Record<string, string>>({});

  // Expense Form
  const [expVehicleId, setExpVehicleId] = useState("");
  const [expType, setExpType] = useState("Tolls");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});

  const handleOpenFuelModal = () => {
    setFuelVehicleId("");
    setFuelLiters("");
    setFuelCost("");
    setFuelDate(new Date().toISOString().split("T")[0]);
    setFuelErrors({});
    setIsFuelModalOpen(true);
  };

  const handleOpenExpenseModal = () => {
    setExpVehicleId("");
    setExpType("Tolls");
    setExpAmount("");
    setExpDate(new Date().toISOString().split("T")[0]);
    setExpErrors({});
    setIsExpenseModalOpen(true);
  };

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelErrors({});

    const formData = {
      vehicle_id: Number(fuelVehicleId),
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      fuel_date: fuelDate,
    };

    const result = fuelLogSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const formattedErrors: Record<string, string> = {};
      Object.keys(fieldErrors).forEach((key) => {
        formattedErrors[key] = fieldErrors[key]?.[0] || "";
      });
      setFuelErrors(formattedErrors);
      return;
    }

    try {
      await createFuelLog(formData);
      toast("Fuel log entry added", "success");
      setIsFuelModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to log fuel entry", "error");
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpErrors({});

    const formData = {
      vehicle_id: Number(expVehicleId),
      type: expType,
      amount: Number(expAmount),
      expense_date: expDate,
    };

    const result = expenseSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const formattedErrors: Record<string, string> = {};
      Object.keys(fieldErrors).forEach((key) => {
        formattedErrors[key] = fieldErrors[key]?.[0] || "";
      });
      setExpErrors(formattedErrors);
      return;
    }

    try {
      await createExpense(formData);
      toast("Expense log entry added", "success");
      setIsExpenseModalOpen(false);
    } catch (err: any) {
      toast(err.message || "Failed to log expense entry", "error");
    }
  };

  const activeVehicles = vehicles.filter(v => v.status !== "retired");

  // Sum calculations
  const totalLiters = fuelLogs.reduce((sum, f) => sum + Number(f.liters), 0);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
  const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost;

  return (
    <RoleGate allowedRoles={["Financial Analyst"]}>
      <div className="space-y-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Fuel & Expenses
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Audit gas purchases, tolls, and maintenance operational costs.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenFuelModal}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Log Fuel</span>
            </button>
            <button
              onClick={handleOpenExpenseModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Spacing card summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Fuel Liters</p>
              <h3 className="text-xl font-bold font-mono text-slate-100 mt-1">{formatNumber(totalLiters)} L</h3>
            </div>
          </div>

          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Fuel Cost</p>
              <h3 className="text-xl font-bold font-mono text-slate-100 mt-1">{formatCurrency(totalFuelCost)}</h3>
            </div>
          </div>

          <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Maintenance Cost</p>
              <h3 className="text-xl font-bold font-mono text-slate-100 mt-1">{formatCurrency(totalMaintCost)}</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-850 gap-4">
          <button
            onClick={() => setActiveTab("fuel")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === "fuel" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === "expenses" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Other Expenses
          </button>
        </div>

        {/* Display logs tables */}
        {activeTab === "fuel" ? (
          <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Liters</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Fuel Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {fuelLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-sm text-slate-500">
                        No fuel logs recorded.
                      </td>
                    </tr>
                  ) : (
                    fuelLogs.map((log) => {
                      const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                      return (
                        <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800">
                              {vehicle ? vehicle.registration_number : `ID ${log.vehicle_id}`}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-300 text-sm">{log.fuel_date}</td>
                          <td className="p-4 font-mono text-slate-200 text-sm">{log.liters} L</td>
                          <td className="p-4 font-mono text-emerald-400 font-bold text-sm text-right">{formatCurrency(log.cost)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Trip</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Toll</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Other</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Maint. (Linked)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-sm text-slate-500">
                        No expenses logged.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => {
                      const vehicle = vehicles.find(v => v.id === exp.vehicle_id);
                      // Sum linked maintenance costs for this vehicle
                      const linkedMaint = maintenanceLogs
                        .filter(m => m.vehicle_id === exp.vehicle_id)
                        .reduce((sum, m) => sum + m.cost, 0);

                      const rowTotal = Number(exp.amount) + linkedMaint;

                      return (
                        <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 font-mono text-xs text-indigo-400">TR001</td>
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-400 px-2.5 py-1.5 rounded-lg border border-slate-800">
                              {vehicle ? vehicle.registration_number : `ID ${exp.vehicle_id}`}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-300 text-sm">
                            {exp.type === "Tolls" ? formatCurrency(exp.amount) : "Rs 0"}
                          </td>
                          <td className="p-4 font-mono text-slate-300 text-sm">
                            {exp.type !== "Tolls" ? formatCurrency(exp.amount) : "Rs 0"}
                          </td>
                          <td className="p-4 font-mono text-slate-400 text-sm">{formatCurrency(linkedMaint)}</td>
                          <td className="p-4 font-mono text-emerald-400 font-bold text-sm text-right">{formatCurrency(rowTotal)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Aggregates Bar */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between gap-6 shadow-inner">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Total Operational Cost (Auto)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Automatically computed: Fuel + Maintenance costs</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-bold font-mono text-2xl">
              {formatCurrency(totalOperationalCost)}
            </span>
          </div>
        </div>

        {/* Fuel Modal */}
        {isFuelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFuelModalOpen(false)} />
            
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden animate-slide-in">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">Log Fuel Purchase</h2>
                <button onClick={() => setIsFuelModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFuel} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Vehicle</label>
                  <select
                    value={fuelVehicleId}
                    onChange={(e) => setFuelVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Truck --</option>
                    {activeVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name}
                      </option>
                    ))}
                  </select>
                  {fuelErrors.vehicle_id && <p className="text-xs text-rose-400 font-medium">{fuelErrors.vehicle_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Liters (L)</label>
                    <input
                      type="number"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 42"
                    />
                    {fuelErrors.liters && <p className="text-xs text-rose-400 font-medium">{fuelErrors.liters}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cost (Rs)</label>
                    <input
                      type="number"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 3150"
                    />
                    {fuelErrors.cost && <p className="text-xs text-rose-400 font-medium">{fuelErrors.cost}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Purchase</label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  {fuelErrors.fuel_date && <p className="text-xs text-rose-400 font-medium">{fuelErrors.fuel_date}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsFuelModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFuel}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
                  >
                    {isCreatingFuel ? "Logging..." : "Log Fuel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsExpenseModalOpen(false)} />
            
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden animate-slide-in">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">Log Operational Expense</h2>
                <button onClick={() => setIsExpenseModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Vehicle</label>
                  <select
                    value={expVehicleId}
                    onChange={(e) => setExpVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Truck --</option>
                    {activeVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name}
                      </option>
                    ))}
                  </select>
                  {expErrors.vehicle_id && <p className="text-xs text-rose-400 font-medium">{expErrors.vehicle_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Type</label>
                    <select
                      value={expType}
                      onChange={(e) => setExpType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Tolls">Tolls</option>
                      <option value="Parking">Parking</option>
                      <option value="Other">Other Operational</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount (Rs)</label>
                    <input
                      type="number"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. 120"
                    />
                    {expErrors.amount && <p className="text-xs text-rose-400 font-medium">{expErrors.amount}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Expense</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  {expErrors.expense_date && <p className="text-xs text-rose-400 font-medium">{expErrors.expense_date}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingExpense}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
                  >
                    {isCreatingExpense ? "Logging..." : "Log Expense"}
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
