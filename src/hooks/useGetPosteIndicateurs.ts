import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type {
  PosteIndicateur,
  PosteIndicateursErrorResponse,
} from "../types/postesIndicateurs";

interface UseGetPosteIndicateursOptions
  extends Omit<
    UseQueryOptions<PosteIndicateur[], Error>,
    "queryKey" | "queryFn"
  > {
  posteId: number;
}

export const useGetPosteIndicateurs = (
  options: UseGetPosteIndicateursOptions,
) => {
  const { posteId, ...queryOptions } = options;

  return useQuery<PosteIndicateur[], Error>({
    queryKey: ["posteIndicateurs", posteId],
    queryFn: async () => {
      console.log(
        `[useGetPosteIndicateurs] Fetching indicateurs for poste ID: ${posteId}`,
      );
      console.log(
        `[useGetPosteIndicateurs] API endpoint: /iam/postes-emission/${posteId}/indicateurs/`,
      );

      try {
        const response = await fetchClient<PosteIndicateur[]>(
          `/iam/postes-emission/${posteId}/indicateurs/`,
        );

        console.log(`[useGetPosteIndicateurs] Raw response:`, response);

        if (response.error) {
          console.error(`[useGetPosteIndicateurs] API Error:`, response.error);

          // Handle different types of errors
          if (response.error.detail) {
            throw new Error(response.error.detail);
          }

          if (
            response.error.non_field_errors &&
            response.error.non_field_errors.length > 0
          ) {
            throw new Error(response.error.non_field_errors.join(", "));
          }

          // Check for 404 or other status codes
          if (response.status === 404) {
            console.warn(
              `[useGetPosteIndicateurs] Poste ${posteId} not found, returning empty array`,
            );
            return [];
          }

          throw new Error(
            `Failed to fetch indicators for poste ${posteId}: ${JSON.stringify(response.error)}`,
          );
        }

        if (!response.data) {
          console.warn(
            `[useGetPosteIndicateurs] No data received for poste ${posteId}`,
          );
          return [];
        }

        // Validate data structure
        if (!Array.isArray(response.data)) {
          console.error(
            `[useGetPosteIndicateurs] Invalid data format - expected array, got:`,
            typeof response.data,
            response.data,
          );
          throw new Error(`Invalid data format received for poste ${posteId}`);
        }

        console.log(
          `[useGetPosteIndicateurs] Successfully fetched ${response.data.length} indicateurs for poste ${posteId}:`,
          response.data,
        );
        return response.data;
      } catch (error) {
        console.error(
          `[useGetPosteIndicateurs] Error fetching indicateurs for poste ${posteId}:`,
          error,
        );
        throw error;
      }
    },
    enabled: !!posteId, // Only run query if posteId is provided and valid
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error.message.includes("404")) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    ...queryOptions,
  });
};
