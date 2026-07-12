import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDrivers, getDriver, createDriver, updateDriver, deleteDriver } from "@/lib/api/drivers";
import { Driver } from "@/types/driver";

export function useDrivers() {
  const queryClient = useQueryClient();

  const driversQuery = useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const createMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Driver> }) => updateDriver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  return {
    drivers: driversQuery.data || [],
    isLoading: driversQuery.isLoading,
    error: driversQuery.error,
    createDriver: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateDriver: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteDriver: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDriver(id: number) {
  return useQuery<Driver>({
    queryKey: ["drivers", id],
    queryFn: () => getDriver(id),
    enabled: !!id,
  });
}
