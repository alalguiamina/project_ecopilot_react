import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type {
  CreateSaisieRequest,
  Saisie,
  SaisieErrorResponse,
} from "../types/saisie";

interface UseCreateSaisieOptions
  extends Omit<
    UseMutationOptions<Saisie, Error, CreateSaisieRequest>,
    "mutationFn"
  > {}

export const useCreateSaisie = (options: UseCreateSaisieOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<Saisie, Error, CreateSaisieRequest>({
    mutationFn: async (data: CreateSaisieRequest): Promise<Saisie> => {
      console.log("[useCreateSaisie] Creating saisie with data:", data);

      const response = await fetchClient<Saisie>("/core/saisies/", {
        method: "POST",
        body: data,
      });

      console.log("[useCreateSaisie] Response:", response);

      if (response.error) {
        console.error("[useCreateSaisie] API Error:", response.error);

        // Handle validation errors
        if (response.error.non_field_errors) {
          throw new Error(response.error.non_field_errors.join(", "));
        }

        if (response.error.detail) {
          throw new Error(response.error.detail);
        }

        // Generic error
        throw new Error(
          `Failed to create saisie: ${JSON.stringify(response.error)}`,
        );
      }

      if (!response.data) {
        throw new Error("No data received from create saisie");
      }

      console.log(
        "[useCreateSaisie] Successfully created saisie:",
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
      // Add the new saisie to cache
      queryClient.setQueryData(["saisie", data.id], data);
    },
    ...options,
  });
};

export default useCreateSaisie;
