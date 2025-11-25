// Utility to force token refresh when access token is missing
export const ensureValidAccessToken = async (): Promise<boolean> => {
  console.log("[ensureValidAccessToken] Checking token status...");

  // Check if we have a valid access token
  const tokenKeys = [
    "authToken",
    "ACCESS_TOKEN",
    "access_token",
    "token",
    "accessToken",
  ];

  const existingToken = tokenKeys
    .map((key) => localStorage.getItem(key))
    .find((token) => token !== null);

  if (existingToken) {
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(existingToken.split(".")[1]));
      const now = Date.now() / 1000;
      const isExpired = payload.exp < now;

      if (!isExpired) {
        console.log("[ensureValidAccessToken] ✅ Valid access token found");
        return true;
      } else {
        console.log(
          "[ensureValidAccessToken] ⏰ Access token is expired, attempting refresh",
        );
      }
    } catch (e) {
      console.log(
        "[ensureValidAccessToken] ⚠️ Cannot decode token, attempting refresh",
      );
    }
  } else {
    console.log(
      "[ensureValidAccessToken] ❌ No access token found, attempting refresh",
    );
  }

  // Try to refresh the token using our own logic
  const refreshKeys = [
    "refreshToken",
    "REFRESH_TOKEN",
    "refresh_token",
    "refresh",
  ];

  const refreshToken = refreshKeys
    .map((key) => localStorage.getItem(key))
    .find((token) => token !== null);

  if (!refreshToken) {
    console.log("[ensureValidAccessToken] ❌ No refresh token available");
    return false;
  }

  // Attempt token refresh
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const REFRESH_ENDPOINT = "/token/refresh/";

  try {
    console.log("[ensureValidAccessToken] 🔄 Attempting token refresh...");
    const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.log(
        "[ensureValidAccessToken] ❌ Refresh request failed:",
        response.status,
        response.statusText,
      );
      return false;
    }

    const data = await response.json();
    console.log("[ensureValidAccessToken] 📦 Refresh response:", data);

    const newAccess = data?.access ?? data?.access_token ?? null;
    if (newAccess) {
      // Store the new tokens
      localStorage.setItem("authToken", newAccess);
      localStorage.setItem("ACCESS_TOKEN", newAccess);
      localStorage.setItem("access_token", newAccess);

      if (data?.refresh ?? data?.refresh_token) {
        const newRefresh = data.refresh ?? data.refresh_token;
        localStorage.setItem("refreshToken", newRefresh);
        localStorage.setItem("REFRESH_TOKEN", newRefresh);
        localStorage.setItem("refresh_token", newRefresh);
      }

      console.log("[ensureValidAccessToken] ✅ Token refreshed successfully");
      return true;
    }

    console.log(
      "[ensureValidAccessToken] ❌ No new access token in refresh response",
    );
    return false;
  } catch (error) {
    console.error("[ensureValidAccessToken] ❌ Refresh failed:", error);
    return false;
  }
};
