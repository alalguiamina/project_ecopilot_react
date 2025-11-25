import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";

// Test hook to check if the API endpoint works
export const useTestPosteIndicateurs = (posteId: number) => {
  return useQuery({
    queryKey: ["testPosteIndicateurs", posteId],
    queryFn: async () => {
      console.log(
        `[useTestPosteIndicateurs] Testing endpoint for poste ${posteId}`,
      );

      // Try different endpoint variations
      const endpoints = [
        `/postes-user/emission/${posteId}/indicateurs/`,
        `/user/postes-emission/${posteId}/indicateurs/`,
        `/postes-emission/${posteId}/indicateurs/`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`@a ${endpoint}`);
          const response = await fetchClient(endpoint);
          console.log(
            `[useTestPosteIndicateurs] Response for ${endpoint}:`,
            response,
          );

          if (!response.error) {
            console.log(
              `[useTestPosteIndicateurs] Success with endpoint: ${endpoint}`,
            );
            return { endpoint, response };
          }
        } catch (error) {
          console.log(
            `[useTestPosteIndicateurs] Failed endpoint ${endpoint}:`,
            error,
          );
        }
      }

      throw new Error("All endpoints failed");
    },
    enabled: !!posteId,
    retry: false,
  });
};
