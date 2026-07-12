import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from "@/lib/api/vehicles";
import { Vehicle } from "@/types/vehicle";

export function useVehicles() {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) => updateVehicle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    createVehicle: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateVehicle: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteVehicle: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useVehicle(id: number) {
  return useQuery<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicle(id),
    enabled: !!id,
  });
}
