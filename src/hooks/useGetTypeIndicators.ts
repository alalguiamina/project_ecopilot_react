import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type {
  TypeIndicateur,
  TypeIndicateursErrorResponse,
} from "../types/typeIndicateurs";

interface UseGetTypeIndicateursOptions
  extends Omit<
    UseQueryOptions<TypeIndicateur[], Error>,
    "queryKey" | "queryFn"
  > {}

export const useGetTypeIndicateurs = (
  options: UseGetTypeIndicateursOptions = {},
) => {
  return useQuery<TypeIndicateur[], Error>({
    queryKey: ["typeIndicateurs"],
    queryFn: async () => {
      console.log("[useGetTypeIndicateurs] Fetching type indicateurs...");

      const response = await fetchClient<TypeIndicateur[]>(
        "/user/type-indicateurs/",
      );

      if (response.error) {
        const errorMessage =
          response.error.detail ||
          response.error.non_field_errors?.[0] ||
          "Failed to fetch type indicateurs";
        throw new Error(errorMessage);
      }

      if (!response.data) {
        console.warn("[useGetTypeIndicateurs] No data received");
        return [];
      }

      console.log(
        "[useGetTypeIndicateurs] Successfully fetched",
        response.data.length,
        "type indicateurs",
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes since these don't change often
    ...options,
  });
};
