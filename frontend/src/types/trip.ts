import { Vehicle } from "./vehicle";
import { Driver } from "./driver";

export type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  vehicle_id: number;
  driver_id: number;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  final_odometer: number | null;
  fuel_consumed: number | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  
  // Relations
  vehicle?: Vehicle;
  driver?: Driver;
}
