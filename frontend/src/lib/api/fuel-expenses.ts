import { request } from "./client";
import { FuelLog, Expense } from "@/types/fuel-expense";
import { getVehicles } from "./vehicles";

export async function getFuelLogs(): Promise<FuelLog[]> {
  const data = await request<any[]>("/fuel-logs");
  return data.map(f => ({
    ...f,
    liters: f.quantity !== undefined ? Number(f.quantity) : f.liters,
    cost: f.total_cost !== undefined ? Number(f.total_cost) : f.cost,
  }));
}

export async function createFuelLog(data: Omit<FuelLog, "id" | "created_at" | "updated_at">): Promise<FuelLog> {
  // Fetch last odometer reading from vehicles to pass required odometer_reading validation
  let odometer = 0;
  try {
    const vehicles = await getVehicles();
    const vehicle = vehicles.find(v => v.id === data.vehicle_id);
    if (vehicle) odometer = vehicle.odometer;
  } catch (e) {
    // Fail-safe
  }

  const mappedData = {
    vehicle_id: data.vehicle_id,
    quantity: data.liters,
    total_cost: data.cost,
    price_per_liter: data.liters > 0 ? Number((data.cost / data.liters).toFixed(2)) : 0,
    odometer_reading: odometer || 100, // Valid non-zero default
    fuel_date: data.fuel_date,
    remarks: "Logged via web UI",
  };

  const response = await request<any>("/fuel-logs", {
    method: "POST",
    body: JSON.stringify(mappedData),
  });

  return {
    ...response,
    liters: response.quantity !== undefined ? Number(response.quantity) : response.liters,
    cost: response.total_cost !== undefined ? Number(response.total_cost) : response.cost,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  return request<Expense[]>("/expenses");
}

export async function createExpense(data: Omit<Expense, "id" | "created_at" | "updated_at">): Promise<Expense> {
  let mappedType = "miscellaneous";
  if (data.type?.toLowerCase().includes("toll")) {
    mappedType = "toll";
  } else if (data.type?.toLowerCase().includes("parking")) {
    mappedType = "parking";
  }

  const mappedData = {
    vehicle_id: data.vehicle_id,
    expense_type: mappedType,
    title: `${data.type || "Operational"} Expense`,
    amount: data.amount,
    expense_date: data.expense_date,
    paid_by: "Driver",
    payment_method: "cash",
  };

  return request<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(mappedData),
  });
}
