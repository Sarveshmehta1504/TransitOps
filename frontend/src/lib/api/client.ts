/**
 * TransitOps Frontend API Client Contract
 * 
 * Authentication Mechanism:
 * - Bearer Token based authentication (stored in localStorage or HTTP Cookie).
 * - Redirects to /login if token is missing.
 * 
 * Expected Real Endpoints:
 * - GET  /health -> Laravel API response check (public)
 * - GET  /user   -> Authenticated User profile
 * 
 * Contract Endpoints (Moched/Local first if Laravel route is not active):
 * - GET/POST/PUT/DELETE /vehicles      -> Vehicle registry CRUD
 * - GET/POST/PUT/DELETE /drivers       -> Driver management CRUD
 * - GET/POST/PUT/DELETE /trips         -> Trip dispatch and updates
 * - GET/POST/PUT/DELETE /maintenance   -> Vehicle maintenance entries
 * - GET/POST/PUT/DELETE /fuel-expenses -> Operational logs
 * - GET                 /reports       -> Analytics aggregates
 */

import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Trip } from "@/types/trip";
import { MaintenanceLog } from "@/types/maintenance";
import { FuelLog, Expense } from "@/types/fuel-expense";
import { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Initialize localStorage Mock DB with seed data if not present
const isServer = typeof window === "undefined";

const SEED_VEHICLES: Vehicle[] = [
  { id: 1, registration_number: "TX-492-A", name: "Kenworth T680", type: "Semi-Truck", max_load_capacity: 45000, odometer: 124500, acquisition_cost: 145000, status: "available", created_at: "2025-01-10", updated_at: "2025-01-10" },
  { id: 2, registration_number: "NY-810-F", name: "Ford F-550", type: "Flatbed", max_load_capacity: 19500, odometer: 42100, acquisition_cost: 72000, status: "in_shop", created_at: "2025-02-14", updated_at: "2025-02-14" },
  { id: 3, registration_number: "CA-339-C", name: "Mercedes Sprinter", type: "Delivery Van", max_load_capacity: 4500, odometer: 18200, acquisition_cost: 54000, status: "on_trip", created_at: "2025-03-01", updated_at: "2025-03-01" },
  { id: 4, registration_number: "FL-902-X", name: "Isuzu NPR-HD", type: "Box Truck", max_load_capacity: 14500, odometer: 89000, acquisition_cost: 65000, status: "available", created_at: "2024-08-20", updated_at: "2024-08-20" },
  { id: 5, registration_number: "IL-441-Z", name: "Peterbilt 579", type: "Semi-Truck", max_load_capacity: 45000, odometer: 320400, acquisition_cost: 160000, status: "retired", created_at: "2022-04-12", updated_at: "2022-04-12" },
];

const SEED_DRIVERS: Driver[] = [
  { id: 1, name: "Marcus Vance", license_number: "DL-CA90210", license_category: "Class A CDL", license_expiry: "2026-11-15", contact_number: "+1 (415) 555-0142", safety_score: 98, status: "available", created_at: "2025-01-10", updated_at: "2025-01-10" },
  { id: 2, name: "Elena Rostova", license_number: "DL-NY44102", license_category: "Class A CDL", license_expiry: "2026-08-20", contact_number: "+1 (212) 555-0189", safety_score: 94, status: "on_trip", created_at: "2025-02-14", updated_at: "2025-02-14" },
  { id: 3, name: "Dominic Torres", license_number: "DL-TX88912", license_category: "Class B CDL", license_expiry: "2026-07-28", contact_number: "+1 (512) 555-0199", safety_score: 82, status: "off_duty", created_at: "2025-03-01", updated_at: "2025-03-01" },
  { id: 4, name: "Clara Oswald", license_number: "DL-FL32901", license_category: "Class A CDL", license_expiry: "2026-06-10", contact_number: "+1 (305) 555-0112", safety_score: 100, status: "available", created_at: "2024-08-20", updated_at: "2024-08-20" },
  { id: 5, name: "James Holden", license_number: "DL-IL77290", license_category: "Class A CDL", license_expiry: "2026-07-15", contact_number: "+1 (312) 555-0177", safety_score: 65, status: "suspended", created_at: "2022-04-12", updated_at: "2022-04-12" },
];

const SEED_TRIPS: Trip[] = [
  { id: 1, vehicle_id: 3, driver_id: 2, source: "Los Angeles Warehouse A", destination: "San Francisco Hub 4", cargo_weight: 3800, planned_distance: 380, final_odometer: null, fuel_consumed: null, status: "dispatched", created_at: "2026-07-10T14:00:00Z", updated_at: "2026-07-10T14:00:00Z" },
  { id: 2, vehicle_id: 1, driver_id: 1, source: "Houston Logistics Yard", destination: "Dallas Freight Terminal", cargo_weight: 42000, planned_distance: 240, final_odometer: 124740, fuel_consumed: 38, status: "completed", created_at: "2026-07-09T08:00:00Z", updated_at: "2026-07-09T12:30:00Z" },
];

const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: 1, vehicle_id: 2, title: "Transmission Fluid Flush", description: "Standard scheduled flush, slippage detected in 3rd gear.", cost: 850, start_date: "2026-07-11", end_date: null, active: true, created_at: "2026-07-11", updated_at: "2026-07-11" },
];

const SEED_FUEL: FuelLog[] = [
  { id: 1, vehicle_id: 1, liters: 150, cost: 210, fuel_date: "2026-07-09", created_at: "2026-07-09", updated_at: "2026-07-09" },
  { id: 2, vehicle_id: 3, liters: 45, cost: 68, fuel_date: "2026-07-10", created_at: "2026-07-10", updated_at: "2026-07-10" },
];

const SEED_EXPENSES: Expense[] = [
  { id: 1, vehicle_id: 1, type: "Tolls", amount: 45, expense_date: "2026-07-09", created_at: "2026-07-09", updated_at: "2026-07-09" },
];

function getMockDB<T>(key: string, defaultSeed: T[]): T[] {
  if (isServer) return defaultSeed;
  const data = localStorage.getItem(`transitops_mock_${key}`);
  if (!data) {
    localStorage.setItem(`transitops_mock_${key}`, JSON.stringify(defaultSeed));
    return defaultSeed;
  }
  return JSON.parse(data) as T[];
}

export function setMockDB<T>(key: string, data: T[]): void {
  if (!isServer) {
    localStorage.setItem(`transitops_mock_${key}`, JSON.stringify(data));
  }
}

// Global local database wrapper
export const mockDB = {
  getVehicles: () => getMockDB<Vehicle>("vehicles", SEED_VEHICLES),
  setVehicles: (data: Vehicle[]) => setMockDB<Vehicle>("vehicles", data),
  getDrivers: () => getMockDB<Driver>("drivers", SEED_DRIVERS),
  setDrivers: (data: Driver[]) => setMockDB<Driver>("drivers", data),
  getTrips: () => getMockDB<Trip>("trips", SEED_TRIPS),
  setTrips: (data: Trip[]) => setMockDB<Trip>("trips", data),
  getMaintenance: () => getMockDB<MaintenanceLog>("maintenance", SEED_MAINTENANCE),
  setMaintenance: (data: MaintenanceLog[]) => setMockDB<MaintenanceLog>("maintenance", data),
  getFuel: () => getMockDB<FuelLog>("fuel", SEED_FUEL),
  setFuel: (data: FuelLog[]) => setMockDB<FuelLog>("fuel", data),
  getExpenses: () => getMockDB<Expense>("expenses", SEED_EXPENSES),
  setExpenses: (data: Expense[]) => setMockDB<Expense>("expenses", data),
};

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = !isServer ? localStorage.getItem("transitops_auth_token") : null;
  
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw { status: res.status, message: errBody.message || `HTTP error: ${res.status}` };
    }
    return res.json() as Promise<T>;
  } catch (error: any) {
    // If backend 404/500/failed to fetch, we fallback to mockDB
    if (error.status === 404 || error.message?.includes("Failed to fetch") || !options) {
      console.warn(`API path ${path} returned error or missing. Falling back to local Storage Mock DB.`);
      return handleMockRequest<T>(path, options);
    }
    throw error;
  }
}

function handleMockRequest<T>(path: string, options?: RequestInit): T {
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body as string) : null;
  const pathClean = path.replace(/^\/api/, "").replace(/^\//, "");

  if (pathClean === "health") {
    return { status: "ok", timestamp: new Date().toISOString(), message: "Mock Mode Responsive" } as T;
  }

  // VEHICLES
  if (pathClean.startsWith("vehicles")) {
    const list = mockDB.getVehicles();
    const idMatch = pathClean.match(/vehicles\/(\d+)/);
    
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const vehicle = list.find(v => v.id === id);
      if (!vehicle) throw { status: 404, message: "Vehicle not found" };
      return vehicle as T;
    }

    if (method === "POST" && body) {
      const newVehicle: Vehicle = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setVehicles([...list, newVehicle]);
      return newVehicle as T;
    }

    return list as T;
  }

  // DRIVERS
  if (pathClean.startsWith("drivers")) {
    const list = mockDB.getDrivers();
    const idMatch = pathClean.match(/drivers\/(\d+)/);
    
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const driver = list.find(d => d.id === id);
      if (!driver) throw { status: 404, message: "Driver not found" };
      return driver as T;
    }

    if (method === "POST" && body) {
      const newDriver: Driver = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setDrivers([...list, newDriver]);
      return newDriver as T;
    }

    return list as T;
  }

  // TRIPS
  if (pathClean.startsWith("trips")) {
    const list = mockDB.getTrips();
    const idMatch = pathClean.match(/trips\/(\d+)/);
    
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const trip = list.find(t => t.id === id);
      if (!trip) throw { status: 404, message: "Trip not found" };
      
      // Inject relations for detail view
      const vehicle = mockDB.getVehicles().find(v => v.id === trip.vehicle_id);
      const driver = mockDB.getDrivers().find(d => d.id === trip.driver_id);
      return { ...trip, vehicle, driver } as T;
    }

    if (method === "POST" && body) {
      const newTrip: Trip = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setTrips([...list, newTrip]);
      
      // Auto transition vehicle and driver to on_trip if dispatched
      if (body.status === "dispatched") {
        const vehicles = mockDB.getVehicles();
        mockDB.setVehicles(vehicles.map(v => v.id === body.vehicle_id ? { ...v, status: "on_trip" } : v));
        const drivers = mockDB.getDrivers();
        mockDB.setDrivers(drivers.map(d => d.id === body.driver_id ? { ...d, status: "on_trip" } : d));
      }

      return newTrip as T;
    }

    if (method === "PUT" && body && idMatch) {
      // Find trip update
    }

    // Populate relations for lists
    const enrichedList = list.map(t => ({
      ...t,
      vehicle: mockDB.getVehicles().find(v => v.id === t.vehicle_id),
      driver: mockDB.getDrivers().find(d => d.id === t.driver_id),
    }));

    return enrichedList as T;
  }

  // MAINTENANCE
  if (pathClean.startsWith("maintenance")) {
    const list = mockDB.getMaintenance();
    if (method === "POST" && body) {
      const newMaint: MaintenanceLog = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setMaintenance([...list, newMaint]);

      // Flip vehicle status to in_shop
      const vehicles = mockDB.getVehicles();
      mockDB.setVehicles(vehicles.map(v => v.id === body.vehicle_id ? { ...v, status: "in_shop" } : v));

      return newMaint as T;
    }

    return list.map(m => ({
      ...m,
      vehicle: mockDB.getVehicles().find(v => v.id === m.vehicle_id),
    })) as T;
  }

  // FUEL & EXPENSES
  if (pathClean.startsWith("fuel-logs")) {
    const list = mockDB.getFuel();
    if (method === "POST" && body) {
      const newFuel: FuelLog = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(f => f.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setFuel([...list, newFuel]);
      return newFuel as T;
    }
    return list.map(f => ({
      ...f,
      vehicle: mockDB.getVehicles().find(v => v.id === f.vehicle_id),
    })) as T;
  }

  if (pathClean.startsWith("expenses")) {
    const list = mockDB.getExpenses();
    if (method === "POST" && body) {
      const newExp: Expense = {
        ...body,
        id: list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDB.setExpenses([...list, newExp]);
      return newExp as T;
    }
    return list.map(e => ({
      ...e,
      vehicle: mockDB.getVehicles().find(v => v.id === e.vehicle_id),
    })) as T;
  }

  throw { status: 404, message: "Mock Route not found" };
}
