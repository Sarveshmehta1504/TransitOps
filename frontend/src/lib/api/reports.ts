import { request } from "./client";

export interface ReportData {
  vehicleId: number;
  registrationNumber: string;
  vehicleName: string;
  totalMaintenanceCost: number;
  totalFuelCost: number;
  totalFuelLiters: number;
  totalDistance: number;
  totalTrips: number;
  fuelEfficiency: number; // Miles per Liter or Km per Liter
  roi: number; // (Revenue - (Maint + Fuel)) / Acquisition Cost
  operationalCost: number; // Fuel + Maintenance
}

export interface DashboardStats {
  vehicles: { total: number; available: number; on_trip: number; in_shop: number; retired: number };
  drivers: { total: number; available: number; on_trip: number; off_duty: number; suspended: number };
  trips: { total: number; draft: number; dispatched: number; completed: number; cancelled: number };
  financials?: { fuel_cost: number; expense_cost: number; maintenance_cost: number; total_cost: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/dashboard");
}

export async function getFleetReports(): Promise<ReportData[]> {
  // request() now auto-unwraps { data: [...] } responses
  const [vehicles, maintenance, fuel, trips] = await Promise.all([
    request<any[]>("/reports/vehicles"),
    request<any[]>("/reports/maintenance"),
    request<any[]>("/reports/fuel"),
    request<any[]>("/reports/trips"),
  ]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeMaintenance = Array.isArray(maintenance) ? maintenance : [];
  const safeFuel = Array.isArray(fuel) ? fuel : [];
  const safeTrips = Array.isArray(trips) ? trips : [];

  return safeVehicles.map(vehicle => {
    const vehicleMaintenance = safeMaintenance.filter(m => m.vehicle_id === vehicle.id);
    const vehicleFuel = safeFuel.filter(f => f.vehicle_id === vehicle.id);
    const vehicleTrips = safeTrips.filter(t => t.vehicle_id === vehicle.id);

    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + Number(f.total_cost || f.cost || 0), 0);
    const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + Number(f.quantity || f.liters || 0), 0);
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + Number(t.actual_distance || t.planned_distance || 0), 0);
    
    // Estimate revenue based on cargo weight & distance (Rs 12 per km per ton)
    const estimatedRevenue = vehicleTrips.reduce((sum, t) => {
      if (t.status !== "completed") return sum;
      const tonnage = Number(t.cargo_weight || 0) / 1000;
      return sum + (Number(t.actual_distance || t.planned_distance || 0) * 12 * Math.max(1, tonnage));
    }, 0);

    const operationalCost = totalMaintenanceCost + totalFuelCost;
    const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;
    
    const roi = vehicle.acquisition_cost > 0 
      ? (estimatedRevenue - operationalCost) / Number(vehicle.acquisition_cost) 
      : 0;

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registration_number,
      vehicleName: vehicle.name,
      totalMaintenanceCost,
      totalFuelCost,
      totalFuelLiters,
      totalDistance,
      totalTrips: vehicleTrips.length,
      fuelEfficiency,
      roi: roi * 100,
      operationalCost,
    };
  });
}
