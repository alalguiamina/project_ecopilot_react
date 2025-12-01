import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { User } from "../types/user";

export const useGetUser = (userId: number | null) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User> => {
      if (userId === null) {
        throw new Error("User ID is required");
      }

      const response = await fetchClient<User>(`/iam/users/${userId}/`);

      if (response.error || !response.data) {
        throw response.error || new Error("Failed to fetch user");
      }

      return response.data;
    },
    enabled: userId !== null, // Only run query when userId is provided
  });
};
