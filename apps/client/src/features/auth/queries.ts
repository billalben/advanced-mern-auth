import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../lib/api/auth.api";
import { queryKeys } from "../../lib/query/keys";

export const useCheckAuthQuery = () =>
  useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.checkAuth,
    staleTime: 5 * 60 * 1000,
  });
