import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";

export interface SiteIndicateurConfigItem {
  type_indicateur_id: number;
  obligatoire: boolean;
  poste_emission_id: number;
}

export interface DetailedSiteConfig {
  poste: number;
  indicateurs: Array<{
    id: number;
    obligatoire: boolean;
  }>;
}

export interface DetailedSiteConfigResponse {
  configs: SiteIndicateurConfigItem[];
  organized_configs: DetailedSiteConfig[];
}

export const useGetDetailedSiteConfig = (siteId: number | null) => {
  return useQuery({
    queryKey: ["detailedSiteConfig", siteId],
    queryFn: async (): Promise<DetailedSiteConfigResponse> => {
      if (!siteId) throw new Error("Site ID is required");

      // Use the new GET config endpoint
      const configResp = await fetchClient<{
        configs: SiteIndicateurConfigItem[];
        site: any;
      }>(`/iam/sites/${siteId}/config/`);

      if (configResp.error || !configResp.data) {
        throw (
          configResp.error ||
          new Error(
            `Failed to fetch detailed site configuration for site ${siteId}`,
          )
        );
      }

      const configs = configResp.data.configs || [];

      // Organize configs by poste
      const posteMap = new Map<
        number,
        Array<{ id: number; obligatoire: boolean }>
      >();

      configs.forEach((config) => {
        const posteId = config.poste_emission_id;
        if (!posteMap.has(posteId)) {
          posteMap.set(posteId, []);
        }
        posteMap.get(posteId)!.push({
          id: config.type_indicateur_id,
          obligatoire: config.obligatoire,
        });
      });

      const organized_configs: DetailedSiteConfig[] = Array.from(
        posteMap.entries(),
      ).map(([posteId, indicateurs]) => ({
        poste: posteId,
        indicateurs,
      }));

      return {
        configs,
        organized_configs,
      };
    },
    enabled: Boolean(siteId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
