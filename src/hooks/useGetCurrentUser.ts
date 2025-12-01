import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { User as BackendUser } from "../types/user";
import { error } from "console";

const PROFILE_ENDPOINT =
  process.env.REACT_APP_PROFILE_ENDPOINT || "/iam/users/me/"; // adjust if your backend uses another path

export const useGetCurrentUser = (opts?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<BackendUser> => {
      const resp = await fetchClient<BackendUser>(PROFILE_ENDPOINT, {
        method: "GET",
      });
      //const resp = {
      // data: { id: 1, username: "amina", role: "admin", sites: [] },
      // error: null,
      // status: 200,
      //}; // MOCKED RESPONSE
      if (resp.error || !resp.data) {
        throw resp.error || new Error("Failed to fetch current user");
      }
      console.log("@11", resp.data);
      return resp.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: opts?.enabled ?? true,
    retry: 1,
  });

export default useGetCurrentUser;
