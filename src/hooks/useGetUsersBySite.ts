import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { User } from "../types/user";

export const useGetUsersBySite = (siteId: number | null) =>
  useQuery({
    queryKey: ["users-by-site", siteId],
    queryFn: async (): Promise<User[]> => {
      if (!siteId) return [];

      const resp = await fetchClient<User[]>(`/user/users/?site_id=${siteId}`);
      if (resp.error || !resp.data) {
        throw resp.error || new Error("Failed to fetch users for site");
      }

      // Filter for validators (users and superusers)
      return resp.data.filter(
        (user) =>
          user.role === "user" ||
          user.role === "superuser" ||
          user.role === "admin",
      );
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!siteId,
  });

export default useGetUsersBySite;
