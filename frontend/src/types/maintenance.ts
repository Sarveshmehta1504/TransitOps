import { Vehicle } from "./vehicle";

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  title: string;
  description: string | null;
  cost: number;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  vehicle?: Vehicle;
}
