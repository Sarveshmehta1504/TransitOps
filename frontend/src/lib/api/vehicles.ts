import { request } from "./client";
import { Vehicle } from "@/types/vehicle";

export async function getVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>("/vehicles");
}

export async function getVehicle(id: number): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${id}`);
}

export async function createVehicle(data: Omit<Vehicle, "id" | "created_at" | "updated_at">): Promise<Vehicle> {
  return request<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id: number, data: Partial<Vehicle>): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVehicle(id: number): Promise<void> {
  return request<void>(`/vehicles/${id}`, {
    method: "DELETE",
  });
}
