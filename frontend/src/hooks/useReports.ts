import { useQuery } from "@tanstack/react-query";
import { getFleetReports, ReportData } from "@/lib/api/reports";

export function useReports() {
  const reportsQuery = useQuery<ReportData[]>({
    queryKey: ["reports"],
    queryFn: getFleetReports,
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
  };
}
