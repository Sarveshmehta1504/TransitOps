import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const vehicleSchema = z.object({
  registration_number: z.string().min(2, "Registration number is required").toUpperCase(),
  name: z.string().min(2, "Name/Model is required"),
  type: z.string().min(2, "Type is required"),
  max_load_capacity: z.coerce.number().positive("Capacity must be greater than zero"),
  odometer: z.coerce.number().nonnegative("Odometer must be non-negative"),
  acquisition_cost: z.coerce.number().positive("Cost must be greater than zero"),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]),
});

export const driverSchema = z.object({
  name: z.string().min(2, "Driver name is required"),
  license_number: z.string().min(5, "License number is required").toUpperCase(),
  license_category: z.string().min(1, "License category is required"),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  contact_number: z.string().min(8, "Contact number is required"),
  safety_score: z.coerce.number().min(0).max(100).default(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]),
});

export const tripSchema = z.object({
  vehicle_id: z.coerce.number().positive("Please select a vehicle"),
  driver_id: z.coerce.number().positive("Please select a driver"),
  source: z.string().min(2, "Source location is required"),
  destination: z.string().min(2, "Destination location is required"),
  cargo_weight: z.coerce.number().positive("Cargo weight must be greater than zero"),
  planned_distance: z.coerce.number().positive("Planned distance must be greater than zero"),
  status: z.enum(["draft", "dispatched", "completed", "cancelled"]).default("draft"),
});

export const maintenanceSchema = z.object({
  vehicle_id: z.coerce.number().positive("Please select a vehicle"),
  title: z.string().min(2, "Maintenance title is required"),
  description: z.string().nullable().optional(),
  cost: z.coerce.number().nonnegative("Cost must be non-negative"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export const fuelLogSchema = z.object({
  vehicle_id: z.coerce.number().positive("Please select a vehicle"),
  liters: z.coerce.number().positive("Liters must be positive"),
  cost: z.coerce.number().positive("Cost must be positive"),
  fuel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export const expenseSchema = z.object({
  vehicle_id: z.coerce.number().positive("Please select a vehicle"),
  type: z.string().min(2, "Expense type is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type FuelLogInput = z.infer<typeof fuelLogSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
