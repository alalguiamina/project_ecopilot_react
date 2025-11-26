import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { Saisie } from "../types/saisie";

interface ValidationRequest {
  action: "valider" | "rejeter";
}

interface UseValidateSaisieOptions
  extends Omit<
    UseMutationOptions<
      Saisie,
      Error,
      { id: number; action: "valider" | "rejeter" }
    >,
    "mutationFn"
  > {}

export const useValidateSaisie = (options: UseValidateSaisieOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    Saisie,
    Error,
    { id: number; action: "valider" | "rejeter" }
  >({
    mutationFn: async ({ id, action }): Promise<Saisie> => {
      console.log(`[useValidateSaisie] ${action} saisie`, id);

      const response = await fetchClient<Saisie>(
        `/core/saisies/${id}/validation/`,
        {
          method: "POST",
          body: { action },
        },
      );

      console.log("[useValidateSaisie] Response:", response);

      if (response.error) {
        console.error("[useValidateSaisie] API Error:", response.error);

        // Handle validation errors
        if (response.error.non_field_errors) {
          throw new Error(response.error.non_field_errors.join(", "));
        }

        if (response.error.detail) {
          throw new Error(response.error.detail);
        }

        // Generic error
        throw new Error(
          `Failed to ${action} saisie: ${JSON.stringify(response.error)}`,
        );
      }

      if (!response.data) {
        throw new Error(`No data received from ${action} saisie`);
      }

      console.log(
        `[useValidateSaisie] Successfully ${action}ed saisie:`,
        response.data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch saisies queries
      queryClient.invalidateQueries({ queryKey: ["saisies"] });
      // Update the specific saisie in cache
      queryClient.setQueryData(["saisie", data.id], data);
    },
    ...options,
  });
};

export default useValidateSaisie;
