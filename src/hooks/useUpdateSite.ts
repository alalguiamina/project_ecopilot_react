import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { Site } from "../types/site";

export interface UpdateSiteRequest {
  name?: string;
  require_double_validation?: boolean;
  config_json?: Record<string, any>;
}

export const useUpdateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSiteRequest;
    }): Promise<Site> => {
      const resp = await fetchClient<Site>(`/iam/sites/${id}/`, {
        method: "PATCH",
        body: data,
      });

      if (resp.error || !resp.data) {
        const msg =
          resp.error?.detail ??
          resp.error?.message ??
          JSON.stringify(resp.error) ??
          `Update failed (${resp.status})`;
        throw new Error(msg);
      }

      return resp.data;
    },
    onSuccess: () => {
      // invalidate sites query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
};

export default useUpdateSite;
