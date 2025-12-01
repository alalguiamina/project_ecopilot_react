import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { UpdateUserRequest, User } from "../types/user";

interface UpdateUserParams {
  userId: number;
  userData: UpdateUserRequest;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: UpdateUserParams): Promise<User> => {
      const response = await fetchClient<User>(`/iam/users/${userId}/`, {
        method: "PUT",
        body: userData,
      });

      if (response.error || !response.data) {
        throw response.error || new Error("Failed to update user");
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
