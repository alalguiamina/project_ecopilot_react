import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { CreateSiteRequest, Site } from "../types/site";

export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteData: CreateSiteRequest): Promise<Site> => {
      // Resolve common field names from callers
      const resolvedName =
        (siteData as any).name ??
        (siteData as any).nom ??
        (siteData as any).title ??
        "";

      const body = {
        name: resolvedName,
        // preserve explicit options, default to sensible values if missing
        require_double_validation:
          (siteData as any).require_double_validation ?? false,
        config_json: (siteData as any).config_json ?? {},
      };

      console.log("[useCreateSite] POST /iam/sites/ body:", body);

      // Use fetchClient POST (no manual headers here — fetchClient will attach auth)
      const response = await fetchClient<Site>("/iam/sites/", {
        method: "POST",
        body,
      });

      console.log("[useCreateSite] Response ->", response);

      if (response.error || !response.data) {
        // throw backend validation/error info
        const err = response.error ?? {
          message: "Failed to create site",
          status: response.status,
        };
        throw new Error(JSON.stringify(err));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
};

export default useCreateSite;
