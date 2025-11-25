import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "API/fetchClient";

export const useGetSiteConfig = (siteId: number | null) => {
  return useQuery({
    queryKey: ["siteConfig", siteId],
    queryFn: async () => {
      if (siteId === null) return null;
      const response = await fetchClient(`/user/sites/${siteId}/config/`); // adjust endpoint
      return response.data;
    },
    enabled: !!siteId,
  });
};
