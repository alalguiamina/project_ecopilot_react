import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "API/fetchClient";
import { ensureValidAccessToken } from "Utils/tokenManager";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      console.log(
        "🚀 useDeleteUser mutationFn called with:",
        userId,
        typeof userId,
      );

      // ✅ Check if userId is valid
      if (!userId || isNaN(userId)) {
        throw new Error("Invalid user ID provided");
      }

      // ✅ Ensure we have a valid access token (refresh if needed)
      const hasValidToken = await ensureValidAccessToken();
      if (!hasValidToken) {
        throw new Error("Authentication failed. Please log in again.");
      }

      try {
        console.log("🌐 Making DELETE request to user/users/" + userId + "/");

        // ✅ Make the actual API call
        const response = await fetchClient(`/user/users/${userId}/`, {
          method: "DELETE",
        });

        console.log("✅ Delete response:", response);

        // ✅ Check if response has an error (401, 403, etc)
        if (response.error) {
          const errorDetail =
            response.error.detail || response.error.message || "Unknown error";
          console.error("❌ API returned error:", response.error);

          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 403) {
            throw new Error("You don't have permission to delete this user.");
          } else {
            throw new Error(`API Error: ${errorDetail}`);
          }
        }

        return response.data;
      } catch (error: any) {
        // ✅ Handle different types of errors
        if (error.message?.includes("Authentication")) {
          throw error; // Re-throw authentication errors as-is
        }

        // ✅ Throw a more descriptive error
        const errorMessage = error.message || "Failed to delete user";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      console.log("✅ Delete user successful, invalidating queries");

      // ✅ Invalidate and refetch users list
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: (error) => {
      console.error("❌ useDeleteUser onError:", error);
    },
  });
};
