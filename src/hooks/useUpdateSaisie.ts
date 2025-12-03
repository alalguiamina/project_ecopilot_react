import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type {
  UpdateSaisieRequest,
  Saisie,
  SaisieErrorResponse,
} from "../types/saisie";

interface UseUpdateSaisieOptions
  extends Omit<
    UseMutationOptions<
      Saisie,
      Error,
      { id: number; data: UpdateSaisieRequest }
    >,
    "mutationFn"
  > {}

export const useUpdateSaisie = (options: UseUpdateSaisieOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<Saisie, Error, { id: number; data: UpdateSaisieRequest }>({
    mutationFn: async ({ id, data }): Promise<Saisie> => {
      console.log("[useUpdateSaisie] Updating saisie", id, "with data:", data);

      const response = await fetchClient<Saisie>(`/core/saisies/${id}/`, {
        method: "PATCH",
        body: data,
      });

      console.log("[useUpdateSaisie] Response:", response);

      if (response.error) {
        console.error("[useUpdateSaisie] API Error:", response.error);

        // Handle validation errors
        if (response.error.non_field_errors) {
          throw new Error(response.error.non_field_errors.join(", "));
        }

        if (response.error.detail) {
          throw new Error(response.error.detail);
        }

        // Generic error
        throw new Error(
          `Failed to update saisie: ${JSON.stringify(response.error)}`,
        );
      }

      if (!response.data) {
        throw new Error("No data received from update saisie");
      }

      console.log(
        "[useUpdateSaisie] Successfully updated saisie:",
        response.data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch saisies queries - both general and specific
      queryClient.invalidateQueries({ queryKey: ["saisies"] });
      queryClient.invalidateQueries({ queryKey: ["saisies", data.site] });
      queryClient.invalidateQueries({
        queryKey: ["saisies", data.site, data.mois, data.annee],
      });
      // Update the specific saisie in cache
      queryClient.setQueryData(["saisie", data.id], data);
    },
    ...options,
  });
};

export default useUpdateSaisie;
