import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMaintenanceLogs, createMaintenanceLog } from "@/lib/api/maintenance";
import { MaintenanceLog } from "@/types/maintenance";

export function useMaintenance() {
  const queryClient = useQueryClient();

  const maintenanceQuery = useQuery<MaintenanceLog[]>({
    queryKey: ["maintenance"],
    queryFn: getMaintenanceLogs,
  });

  const createMutation = useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  return {
    logs: maintenanceQuery.data || [],
    isLoading: maintenanceQuery.isLoading,
    error: maintenanceQuery.error,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
