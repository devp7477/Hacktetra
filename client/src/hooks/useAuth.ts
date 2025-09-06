import { useQuery } from "@tanstack/react-query";
import { clerkApi } from "@/lib/clerkApi";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => clerkApi.getCurrentUser(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
