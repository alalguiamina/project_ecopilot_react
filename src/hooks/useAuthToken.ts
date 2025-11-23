import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export interface TokenResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
}

// Use endpoint path only. REACT_APP_API_BASE_URL will be prepended by fetchClient.
const AUTH_ENDPOINT = process.env.REACT_APP_AUTH_TOKEN_ENDPOINT ?? "/token/";

export const useAuthToken = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: {
      username?: string;
      user?: string;
      email?: string;
      password: string;
    }): Promise<TokenResponse> => {
      const username =
        credentials.username ?? credentials.user ?? credentials.email ?? "";
      const body = { username, password: credentials.password };

      const resp = await fetchClient<TokenResponse>(AUTH_ENDPOINT, {
        method: "POST",
        body,
      });

      if (resp.error || !resp.data) {
        const msg =
          resp.error?.detail ??
          resp.error?.message ??
          JSON.stringify(resp.error) ??
          `Auth failed (${resp.status})`;
        throw new Error(msg);
      }
      console.log("@@", resp.data);

      return resp.data;
    },
    onSuccess: (data) => {
      // normalize and save tokens (access + refresh) for refresh flow
      const access = data.access ?? data.access_token ?? data.token;
      const refresh = data.refresh ?? data.refresh_token;

      if (access) {
        try {
          localStorage.setItem(ACCESS_TOKEN ?? "ACCESS_TOKEN", access);
          localStorage.setItem("authToken", access);
        } catch (e) {
          console.warn("Failed to store access token", e);
        }
      }
      if (refresh) {
        try {
          localStorage.setItem(REFRESH_TOKEN ?? "REFRESH_TOKEN", refresh);
          localStorage.setItem("refreshToken", refresh);
        } catch (e) {
          console.warn("Failed to store refresh token", e);
        }
      }

      // ensure current-user refetch so role is available immediately
      qc.invalidateQueries({ queryKey: ["current-user"] });
      qc.refetchQueries({ queryKey: ["current-user"] });
    },
  });
};

export default useAuthToken;
