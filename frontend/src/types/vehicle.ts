export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'retired';

export interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}
