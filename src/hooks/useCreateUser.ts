import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { CreateUserRequest, User } from "../types/user";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserRequest): Promise<User> => {
      const response = await fetchClient<User>("/iam/users/", {
        method: "POST",
        body: userData,
      });

      if (response.error || !response.data) {
        throw response.error || new Error("Failed to create user");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list after successful creation
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
