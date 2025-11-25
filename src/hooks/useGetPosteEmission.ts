import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { PosteEmission } from "../types/postesEmission";

interface UseGetPosteEmissionOptions
  extends Omit<UseQueryOptions<PosteEmission, Error>, "queryKey" | "queryFn"> {
  id: number;
}

export const useGetPosteEmission = ({
  id,
  ...queryOptions
}: UseGetPosteEmissionOptions) => {
  return useQuery<PosteEmission, Error>({
    queryKey: ["posteEmission", id],
    queryFn: async () => {
      console.log(
        `[useGetPosteEmission] Fetching poste emission with id: ${id}`,
      );

      const response = await fetchClient<PosteEmission>(
        `/user/postes-emission/${id}/`,
      );

      if (response.error) {
        const errorMessage =
          response.error.detail || "Failed to fetch poste emission";
        throw new Error(errorMessage);
      }

      if (!response.data) {
        throw new Error("Poste emission not found");
      }

      console.log(
        "[useGetPosteEmission] Successfully fetched poste emission:",
        response.data,
      );
      return response.data;
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...queryOptions,
  });
};
