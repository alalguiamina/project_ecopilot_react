import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { User } from "../types/user";

export interface UseGetUsersOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export const useGetUsers = (options: UseGetUsersOptions = {}) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000,
  } = options;

  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const response = await fetchClient<User[]>("/iam/users/");

      if (response.error || !response.data) {
        throw response.error || new Error("Failed to fetch users");
      }

      return response.data;
    },
    enabled,
    refetchOnWindowFocus,
    staleTime, // Cache for 5 minutes by default
  });
};
