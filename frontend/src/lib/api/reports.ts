import { getVehicles } from "./vehicles";
import { getMaintenanceLogs } from "./maintenance";
import { getFuelLogs } from "./fuel-expenses";
import { getTrips } from "./trips";

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
  const [vehicles, maintenance, fuel, trips] = await Promise.all([
    getVehicles(),
    getMaintenanceLogs(),
    getFuelLogs(),
    getTrips(),
  ]);

  return vehicles.map(vehicle => {
    const vehicleMaintenance = maintenance.filter(m => m.vehicle_id === vehicle.id);
    const vehicleFuel = fuel.filter(f => f.vehicle_id === vehicle.id);
    const vehicleTrips = trips.filter(t => t.vehicle_id === vehicle.id);

    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
    const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + Number(t.planned_distance), 0);
    
    // Estimate revenue based on cargo weight & distance ($1.5 per mile per ton roughly)
    const estimatedRevenue = vehicleTrips.reduce((sum, t) => {
      if (t.status !== "completed") return sum;
      const tonnage = Number(t.cargo_weight) / 2000;
      return sum + (Number(t.planned_distance) * 2.2 * Math.max(1, tonnage));
    }, 0);

    const operationalCost = totalMaintenanceCost + totalFuelCost;
    
    const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;
    
    // ROI calculation: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const roi = vehicle.acquisition_cost > 0 
      ? (estimatedRevenue - operationalCost) / vehicle.acquisition_cost 
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
