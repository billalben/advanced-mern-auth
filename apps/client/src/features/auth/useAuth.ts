import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import type { User } from "./auth.types";

interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

export const useAuth = (): UseAuthResult => {
  const { data, isLoading } = useQuery<User | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => Promise.resolve(null),
    enabled: false,
    staleTime: Infinity,
  });

  const user = data ?? null;

  return {
    user,
    isAuthenticated: !!user,
    isVerified: user?.isVerified ?? false,
    isLoading,
  };
};
