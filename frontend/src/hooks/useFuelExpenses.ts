import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from "@/lib/api/fuel-expenses";
import { FuelLog, Expense } from "@/types/fuel-expense";

export function useFuelExpenses() {
  const queryClient = useQueryClient();

  const fuelQuery = useQuery<FuelLog[]>({
    queryKey: ["fuel_logs"],
    queryFn: getFuelLogs,
  });

  const expenseQuery = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  const createFuelMutation = useMutation({
    mutationFn: createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel_logs"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return {
    fuelLogs: fuelQuery.data || [],
    isFuelLoading: fuelQuery.isLoading,
    expenses: expenseQuery.data || [],
    isExpenseLoading: expenseQuery.isLoading,
    createFuelLog: createFuelMutation.mutateAsync,
    isCreatingFuel: createFuelMutation.isPending,
    createExpense: createExpenseMutation.mutateAsync,
    isCreatingExpense: createExpenseMutation.isPending,
  };
}
