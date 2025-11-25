import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import { ensureValidAccessToken } from "../Utils/tokenManager";

export const useDeleteSite = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: number) => {
      console.log(
        "🚀 useDeleteSite mutationFn called with:",
        siteId,
        typeof siteId,
      );

      // ✅ Check if siteId is valid
      if (!siteId || isNaN(siteId)) {
        throw new Error("Invalid site ID provided");
      }

      // ✅ Ensure we have a valid access token (refresh if needed)
      const hasValidToken = await ensureValidAccessToken();
      if (!hasValidToken) {
        throw new Error("Authentication failed. Please log in again.");
      }

      console.log("🌐 Making DELETE request to user/sites/" + siteId + "/");

      const resp = await fetchClient<void>(`/user/sites/${siteId}/`, {
        method: "DELETE",
      });

      console.log("✅ Delete site response:", resp);

      // ✅ Check if response has an error (401, 403, etc)
      if (resp.error) {
        const errorDetail =
          resp.error.detail || resp.error.message || "Unknown error";
        console.error("❌ API returned error:", resp.error);

        if (resp.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (resp.status === 403) {
          throw new Error("You don't have permission to delete this site.");
        } else {
          throw new Error(`API Error: ${errorDetail}`);
        }
      }

      return resp;
    },
    onSuccess: () => {
      console.log("✅ Delete site successful, invalidating queries");

      // ✅ Invalidate and refetch sites list
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["site-groups"] });
    },
    onError: (error) => {
      console.error("❌ useDeleteSite onError:", error);
    },
  });
};

export default useDeleteSite;
