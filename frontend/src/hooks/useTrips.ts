import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip } from "@/lib/api/trips";
import { Trip } from "@/types/trip";

export function useTrips() {
  const queryClient = useQueryClient();

  const tripsQuery = useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Trip> }) => updateTrip(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  return {
    trips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    error: tripsQuery.error,
    createTrip: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTrip: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTrip: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTrip(id: number) {
  return useQuery<Trip>({
    queryKey: ["trips", id],
    queryFn: () => getTrip(id),
    enabled: !!id,
  });
}
