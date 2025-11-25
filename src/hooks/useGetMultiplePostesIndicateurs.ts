import { useQueries, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { PosteIndicateur } from "../types/postesIndicateurs";

interface UseGetMultiplePostesIndicateursOptions {
  posteIds: number[];
  queryOptions?: Omit<
    UseQueryOptions<PosteIndicateur[], Error>,
    "queryKey" | "queryFn"
  >;
}

export const useGetMultiplePostesIndicateurs = ({
  posteIds,
  queryOptions = {},
}: UseGetMultiplePostesIndicateursOptions) => {
  return useQueries({
    queries: posteIds.map((posteId) => ({
      queryKey: ["posteIndicateurs", posteId],
      queryFn: async () => {
        console.log(
          `[useGetMultiplePostesIndicateurs] Fetching indicateurs for poste ID: ${posteId}`,
        );

        const response = await fetchClient<PosteIndicateur[]>(
          `/postes-user/emission/${posteId}/indicateurs/`,
        );

        if (response.error) {
          const errorMessage =
            response.error.detail ||
            response.error.non_field_errors?.[0] ||
            `Failed to fetch indicateurs for poste ${posteId}`;
          throw new Error(errorMessage);
        }

        return response.data || [];
      },
      enabled: !!posteId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      ...queryOptions,
    })),
  });
};
