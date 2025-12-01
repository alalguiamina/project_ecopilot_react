import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { PartialUpdateUserRequest, User } from "../types/user";

interface PartialUpdateUserParams {
  userId: number;
  userData: PartialUpdateUserRequest;
}

export const usePartialUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: PartialUpdateUserParams): Promise<User> => {
      const response = await fetchClient<User>(`/iam/users/${userId}/`, {
        method: "PATCH",
        body: userData,
      });

      if (response.error || !response.data) {
        throw response.error || new Error("Failed to partially update user");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch users list and specific user after successful update
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
};
