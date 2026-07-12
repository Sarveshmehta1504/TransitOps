import { request } from "./client";
import { MaintenanceLog } from "@/types/maintenance";

export async function getMaintenanceLogs(): Promise<MaintenanceLog[]> {
  return request<MaintenanceLog[]>("/maintenance");
}

export async function createMaintenanceLog(data: Omit<MaintenanceLog, "id" | "created_at" | "updated_at">): Promise<MaintenanceLog> {
  return request<MaintenanceLog>("/maintenance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
