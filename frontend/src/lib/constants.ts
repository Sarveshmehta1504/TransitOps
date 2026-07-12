export const VEHICLE_TYPES = [
  "Semi-Truck",
  "Box Truck",
  "Delivery Van",
  "Flatbed",
  "Refrigerated Truck",
  "Utility Truck",
] as const;

export const VEHICLE_STATUSES = {
  available: { label: "Available", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  on_trip: { label: "On Trip", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  in_shop: { label: "In Shop", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  retired: { label: "Retired", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
} as const;

export const DRIVER_STATUSES = {
  available: { label: "Available", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  on_trip: { label: "On Trip", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  off_duty: { label: "Off Duty", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  suspended: { label: "Suspended", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
} as const;

export const TRIP_STATUSES = {
  draft: { label: "Draft", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  dispatched: { label: "Dispatched", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  completed: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
} as const;
