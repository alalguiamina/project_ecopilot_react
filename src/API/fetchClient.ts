export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

export interface ApiResponse<T> {
  data?: T;
  error?: any;
  status: number;
}

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const REFRESH_ENDPOINT =
  process.env.REACT_APP_AUTH_REFRESH_ENDPOINT ?? "/token/refresh/";

// helper to attempt refresh using refresh token; returns new access token or null
async function tryRefreshToken(): Promise<string | null> {
  const refresh =
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("REFRESH_TOKEN") ||
    localStorage.getItem("refresh_token") ||
    null;
  if (!refresh) return null;

  const fullRefreshUrl = `${API_BASE_URL}${REFRESH_ENDPOINT.startsWith("/") ? REFRESH_ENDPOINT : "/" + REFRESH_ENDPOINT}`;
  try {
    const r = await fetch(fullRefreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh }),
    });
    if (!r.ok) return null;
    const parsed = await r.json();
    const newAccess = parsed?.access ?? parsed?.access_token ?? null;
    if (newAccess) {
      localStorage.setItem("authToken", newAccess);
      localStorage.setItem("ACCESS_TOKEN", newAccess);
      return newAccess;
    }
    return null;
  } catch (e) {
    console.warn("[fetchClient] refresh failed", e);
    return null;
  }
}

export async function fetchClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  // pick token from common keys
  let token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    localStorage.getItem("access_token") ||
    "";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const fullUrl = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  console.log("[fetchClient] Request ->", options.method ?? "GET", fullUrl);
  console.log("[fetchClient] Headers:", headers);
  console.log("[fetchClient] Body:", options.body);

  const doFetch = async (authHeaders: Record<string, string>) =>
    fetch(fullUrl, {
      method: options.method ?? "GET",
      headers: authHeaders,
      mode: "cors",
      cache: "no-cache",
      body:
        options.body instanceof FormData
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
      credentials: "include",
    });

  try {
    let resp = await doFetch(headers);

    let parsed: any = undefined;
    try {
      parsed = await resp.json();
    } catch (e) {
      parsed = undefined;
    }

    // If unauthorized due to invalid token -> try refresh once and retry
    if (
      resp.status === 401 &&
      parsed &&
      typeof parsed === "object" &&
      parsed.code === "token_not_valid"
    ) {
      console.log("[fetchClient] access invalid, attempting refresh");
      const newAccess = await tryRefreshToken();
      if (newAccess) {
        headers["Authorization"] = `Bearer ${newAccess}`;
        resp = await doFetch(headers);
        try {
          parsed = await resp.json();
        } catch (e) {
          parsed = undefined;
        }
      }
    }

    if (!resp.ok) {
      console.warn(
        "[fetchClient] non-ok response:",
        resp.status,
        resp.statusText,
        parsed,
      );
      return {
        error: parsed ?? { statusText: resp.statusText, status: resp.status },
        status: resp.status,
      };
    }

    console.log("[fetchClient] Response OK:", resp.status, parsed);
    return {
      data: parsed as T,
      status: resp.status,
    };
  } catch (networkError) {
    console.error("[fetchClient] Network error ->", networkError);
    return {
      error: { message: "Network error", detail: String(networkError) },
      status: 0,
    };
  }
}
