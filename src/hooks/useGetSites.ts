import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { Site } from "../types/site";

export const useGetSites = () =>
  useQuery({
    queryKey: ["sites"],
    queryFn: async (): Promise<Site[]> => {
      const resp = await fetchClient<Site[]>("/iam/sites/");
      if (resp.error || !resp.data)
        throw resp.error || new Error("Failed to fetch sites");
      return resp.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export default useGetSites;
