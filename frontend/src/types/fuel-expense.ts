import { Vehicle } from "./vehicle";

export interface FuelLog {
  id: number;
  vehicle_id: number;
  liters: number;
  cost: number;
  fuel_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  
  // Relations
  vehicle?: Vehicle;
}

export interface Expense {
  id: number;
  vehicle_id: number;
  type: string;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  
  // Relations
  vehicle?: Vehicle;
}
