import { request } from "./client";
import { FuelLog, Expense } from "@/types/fuel-expense";

export async function getFuelLogs(): Promise<FuelLog[]> {
  return request<FuelLog[]>("/fuel-logs");
}

export async function createFuelLog(data: Omit<FuelLog, "id" | "created_at" | "updated_at">): Promise<FuelLog> {
  return request<FuelLog>("/fuel-logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getExpenses(): Promise<Expense[]> {
  return request<Expense[]>("/expenses");
}

export async function createExpense(data: Omit<Expense, "id" | "created_at" | "updated_at">): Promise<Expense> {
  return request<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
