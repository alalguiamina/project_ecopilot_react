import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type {
  PosteEmission,
  PostesEmissionErrorResponse,
} from "../types/postesEmission";

interface UseGetPostesEmissionOptions
  extends Omit<
    UseQueryOptions<PosteEmission[], Error>,
    "queryKey" | "queryFn"
  > {}

export const useGetPostesEmission = (
  options: UseGetPostesEmissionOptions = {},
) => {
  return useQuery<PosteEmission[], Error>({
    queryKey: ["postesEmission"],
    queryFn: async () => {
      console.log("[useGetPostesEmission] Fetching postes emission...");

      const response = await fetchClient<PosteEmission[]>(
        "/user/postes-emission/",
      );

      if (response.error) {
        const errorMessage =
          response.error.detail ||
          response.error.non_field_errors?.[0] ||
          "Failed to fetch postes emission";
        throw new Error(errorMessage);
      }

      if (!response.data) {
        console.warn("[useGetPostesEmission] No data received");
        return [];
      }

      console.log(
        "[useGetPostesEmission] Successfully fetched",
        response.data.length,
        "postes emission",
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes since these don't change often
    ...options,
  });
};
