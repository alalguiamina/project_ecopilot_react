// useGetSiteConfig.ts - Modified version
import { useQuery } from "@tanstack/react-query";

export const useGetSiteConfig = (siteId: number | null) => {
  return useQuery({
    queryKey: ["siteConfig", siteId],
    queryFn: async () => {
      // Return null for now - config will be empty on first load
      return { configs: [] };
    },
    enabled: false, // Disable this query for now
  });
};
