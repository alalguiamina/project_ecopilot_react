import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { SiteConfigUpdate } from "../types/site";

interface UpdateSiteConfigParams {
  siteId: number;
  config: SiteConfigUpdate;
}

export const useUpdateSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      config,
    }: UpdateSiteConfigParams): Promise<void> => {
      const response = await fetchClient<void>(`/iam/sites/${siteId}/config/`, {
        method: "PUT",
        body: config,
      });

      if (response.error) {
        throw response.error || new Error("Failed to update site config");
      }

      return response.data;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["site", params.siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
};

export default useUpdateSiteConfig;
