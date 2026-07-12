import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout } from "@/lib/api/auth";
import { User, UserRole } from "@/types/user";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth_user"],
    queryFn: getCurrentUser,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password, role }: { email: string; password?: string; role?: UserRole }) => login(email, password, role),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth_user"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth_user"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
