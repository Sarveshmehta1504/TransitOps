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

export async function getFleetReports(): Promise<ReportData[]> {
  const [vehiclesRes, maintenanceRes, fuelRes, tripsRes] = await Promise.all([
    request<{ success: boolean; data: any[] }>("/reports/vehicles"),
    request<{ success: boolean; data: any[] }>("/reports/maintenance"),
    request<{ success: boolean; data: any[] }>("/reports/fuel"),
    request<{ success: boolean; data: any[] }>("/reports/trips"),
  ]);

  const vehicles = vehiclesRes.data || [];
  const maintenance = maintenanceRes.data || [];
  const fuel = fuelRes.data || [];
  const trips = tripsRes.data || [];

  return vehicles.map(vehicle => {
    const vehicleMaintenance = maintenance.filter(m => m.vehicle_id === vehicle.id);
    const vehicleFuel = fuel.filter(f => f.vehicle_id === vehicle.id);
    const vehicleTrips = trips.filter(t => t.vehicle_id === vehicle.id);

    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + Number(f.total_cost || f.cost || 0), 0);
    const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + Number(f.quantity || f.liters || 0), 0);
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + Number(t.actual_distance || t.planned_distance || 0), 0);
    
    // Estimate revenue based on cargo weight & distance (Rs 2.2 per km per ton)
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
      roi: roi * 100, // percentage
      operationalCost,
    };
  });
}
