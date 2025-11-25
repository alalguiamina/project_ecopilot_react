import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useGetPostesEmission } from "./useGetPostesEmission";
import { useGetMultiplePostesIndicateurs } from "./useGetMultiplePostesIndicateurs";
import type { PosteIndicateur } from "../types/postesIndicateurs";

interface UseGetAllPostesIndicateursOptions
  extends Omit<
    UseQueryOptions<PosteIndicateur[], Error>,
    "queryKey" | "queryFn"
  > {}

export const useGetAllPostesIndicateurs = (
  options: UseGetAllPostesIndicateursOptions = {},
) => {
  // First get all postes
  const {
    data: postes,
    isLoading: postesLoading,
    error: postesError,
  } = useGetPostesEmission();

  // Get poste IDs
  const posteIds = postes?.map((poste) => poste.id) || [];

  // Get indicateurs for all postes
  const indicateursQueries = useGetMultiplePostesIndicateurs({
    posteIds,
    queryOptions: {
      enabled: !postesLoading && !postesError && posteIds.length > 0,
    },
  });

  return useQuery<PosteIndicateur[], Error>({
    queryKey: ["allPostesIndicateurs"],
    queryFn: async () => {
      // Combine all indicateurs from all postes
      const allIndicateurs: PosteIndicateur[] = [];

      for (const query of indicateursQueries) {
        if (query.data) {
          allIndicateurs.push(...query.data);
        }
      }

      console.log(
        `[useGetAllPostesIndicateurs] Combined ${allIndicateurs.length} indicateurs from ${posteIds.length} postes`,
      );
      return allIndicateurs;
    },
    enabled: indicateursQueries.every((query) => query.isSuccess),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
