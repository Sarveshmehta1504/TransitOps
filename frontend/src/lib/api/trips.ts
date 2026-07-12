import { request } from "./client";
import { Trip } from "@/types/trip";

export async function getTrips(): Promise<Trip[]> {
  return request<Trip[]>("/trips");
}

export async function getTrip(id: number): Promise<Trip> {
  return request<Trip>(`/trips/${id}`);
}

export async function createTrip(data: Omit<Trip, "id" | "created_at" | "updated_at">): Promise<Trip> {
  return request<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrip(id: number, data: Partial<Trip>): Promise<Trip> {
  return request<Trip>(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(id: number): Promise<void> {
  return request<void>(`/trips/${id}`, {
    method: "DELETE",
  });
}
