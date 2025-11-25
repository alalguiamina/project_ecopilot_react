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

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

console.log("[API] Using base URL:", API_BASE_URL);

const REFRESH_ENDPOINT = "/token/refresh/";

// ✅ Get token from any possible storage key
function getAccessToken(): string | null {
  const possibleKeys = [
    "authToken",
    "ACCESS_TOKEN",
    "access_token",
    "token",
    "accessToken",
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`[fetchClient] Found token in: ${key}`);
      return token;
    }
  }

  console.log("[fetchClient] No access token found in any key");
  return null;
}

// ✅ Get refresh token from any possible storage key
function getRefreshToken(): string | null {
  const possibleKeys = [
    "refreshToken",
    "REFRESH_TOKEN",
    "refresh_token",
    "refresh",
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`[fetchClient] Found refresh token in: ${key}`);
      return token;
    }
  }

  console.log("[fetchClient] No refresh token found in any key");
  return null;
}

// ✅ Store tokens in multiple formats for compatibility
function storeTokens(accessToken: string, refreshToken?: string) {
  // Store access token in multiple keys
  localStorage.setItem("authToken", accessToken);
  localStorage.setItem("ACCESS_TOKEN", accessToken);
  localStorage.setItem("access_token", accessToken);

  // Store refresh token if provided
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("REFRESH_TOKEN", refreshToken);
    localStorage.setItem("refresh_token", refreshToken);
  }
}

async function tryRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    console.log("[fetchClient] No refresh token available for refresh");
    return null;
  }

  const fullRefreshUrl = `${API_BASE_URL}${REFRESH_ENDPOINT}`;
  try {
    console.log("[fetchClient] Attempting token refresh...");
    const r = await fetch(fullRefreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!r.ok) {
      console.log(
        "[fetchClient] Refresh request failed:",
        r.status,
        r.statusText,
      );
      return null;
    }

    const parsed = await r.json();
    console.log("[fetchClient] Refresh response:", parsed);

    const newAccess = parsed?.access ?? parsed?.access_token ?? null;
    if (newAccess) {
      storeTokens(newAccess, parsed?.refresh ?? parsed?.refresh_token);
      console.log("[fetchClient] Token refreshed successfully");
      return newAccess;
    }

    console.log("[fetchClient] No new access token in refresh response");
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
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("[fetchClient] Full URL:", url);
  console.log("[fetchClient] Method:", options.method ?? "GET");

  // ✅ Get token using the new function
  let token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // ✅ Always add Authorization header if we have a token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("[fetchClient] Added Authorization header with token");
  } else {
    console.warn(
      "[fetchClient] ⚠️ NO TOKEN AVAILABLE - Request will likely fail",
    );
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  console.log("[fetchClient] Request headers:", headers);
  console.log("[fetchClient] Request body:", options.body);

  const doFetch = async (authHeaders: Record<string, string>) =>
    fetch(url, {
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
    console.log("[fetchClient] Response status:", resp.status);

    let parsed: any = undefined;
    try {
      parsed = await resp.json();
      console.log("[fetchClient] Response body:", parsed);
    } catch (e) {
      console.log("[fetchClient] No JSON response body");
      parsed = undefined;
    }

    // ✅ Check for 401 Unauthorized
    if (resp.status === 401) {
      console.log("[fetchClient] 401 Unauthorized - attempting token refresh");

      const newAccess = await tryRefreshToken();
      if (newAccess) {
        console.log("[fetchClient] Token refreshed, retrying request");
        headers["Authorization"] = `Bearer ${newAccess}`;
        resp = await doFetch(headers);

        try {
          parsed = await resp.json();
        } catch (e) {
          parsed = undefined;
        }

        console.log("[fetchClient] Retry response status:", resp.status);
      } else {
        console.log("[fetchClient] Token refresh failed - user needs to login");
        // Optionally redirect to login here
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

    console.log("[fetchClient] Response OK:", resp.status);
    return {
      data: parsed as T,
      status: resp.status,
    };
  } catch (networkError) {
    console.error("[fetchClient] Network error ->", networkError);
    console.error("[fetchClient] Attempted URL:", url);
    return {
      error: { message: "Network error", detail: String(networkError) },
      status: 0,
    };
  }
}
