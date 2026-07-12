import { request } from "./client";
import { Driver } from "@/types/driver";

export async function getDrivers(): Promise<Driver[]> {
  return request<Driver[]>("/drivers");
}

export async function getDriver(id: number): Promise<Driver> {
  return request<Driver>(`/drivers/${id}`);
}

export async function createDriver(data: Omit<Driver, "id" | "created_at" | "updated_at">): Promise<Driver> {
  return request<Driver>("/drivers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDriver(id: number, data: Partial<Driver>): Promise<Driver> {
  return request<Driver>(`/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDriver(id: number): Promise<void> {
  return request<void>(`/drivers/${id}`, {
    method: "DELETE",
  });
}
