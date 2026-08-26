import { useCheckAuthQuery } from "./queries";
import type { User } from "./auth.types";

interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

export const useAuth = (): UseAuthResult => {
  const { data, isLoading } = useCheckAuthQuery();

  const user = (data as User | null | undefined) ?? null;

  return {
    user,
    isAuthenticated: !!user,
    isVerified: user?.isVerified ?? false,
    isLoading,
  };
};
