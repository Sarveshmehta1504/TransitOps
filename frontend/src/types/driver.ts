export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'suspended';

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string; // YYYY-MM-DD
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  created_at: string;
  updated_at: string;
}
