import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { Saisie, SaisieErrorResponse } from "../types/saisie";

interface UseGetSaisiesOptions
  extends Omit<UseQueryOptions<Saisie[], Error>, "queryKey" | "queryFn"> {
  siteId?: number;
  mois?: number;
  annee?: number;
}

export const useGetSaisies = (options: UseGetSaisiesOptions = {}) => {
  const { siteId, mois, annee, ...queryOptions } = options;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (siteId) queryParams.append("site", siteId.toString());
  if (mois) queryParams.append("mois", mois.toString());
  if (annee) queryParams.append("annee", annee.toString());

  const queryString = queryParams.toString();
  const endpoint = `/core/saisies/${queryString ? `?${queryString}` : ""}`;

  return useQuery<Saisie[], Error>({
    queryKey: ["saisies", siteId, mois, annee],
    queryFn: async (): Promise<Saisie[]> => {
      console.log("[useGetSaisies] Fetching saisies from:", endpoint);

      const response = await fetchClient<Saisie[]>(endpoint);

      console.log("[useGetSaisies] Response:", response);

      if (response.error) {
        console.error("[useGetSaisies] API Error:", response.error);

        if (response.error.detail) {
          throw new Error(response.error.detail);
        }

        if (response.error.non_field_errors) {
          throw new Error(response.error.non_field_errors.join(", "));
        }

        throw new Error(
          `Failed to fetch saisies: ${JSON.stringify(response.error)}`,
        );
      }

      if (!response.data) {
        console.warn("[useGetSaisies] No data received");
        return [];
      }

      console.log(
        "[useGetSaisies] Successfully fetched",
        response.data.length,
        "saisies",
      );
      return response.data;
    },
    ...queryOptions,
  });
};

export default useGetSaisies;
