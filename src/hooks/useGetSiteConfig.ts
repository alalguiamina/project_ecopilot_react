import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";

interface SiteConfigResponse {
  config_json?: Array<{
    poste: number;
    indicateurs: number[];
  }>;
}

export const useGetSiteConfig = (siteId: number | null) => {
  return useQuery({
    queryKey: ["siteConfig", siteId],
    queryFn: async (): Promise<SiteConfigResponse> => {
      if (!siteId) throw new Error("Site ID is required");

      const resp = await fetchClient<any>(`/iam/sites/${siteId}/`);
      if (resp.error || !resp.data) {
        throw (
          resp.error ||
          new Error(`Failed to fetch site configuration for site ${siteId}`)
        );
      }
      // Extract just the config_json from the site data
      return {
        config_json: resp.data.config_json || [],
      };
    },
    enabled: Boolean(siteId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
