// Debug utility to check authentication status
export const debugAuth = () => {
  console.log("=== AUTHENTICATION DEBUG ===");

  // Check all possible token storage locations
  const tokenKeys = [
    "authToken",
    "ACCESS_TOKEN",
    "access_token",
    "token",
    "accessToken",
  ];

  const refreshKeys = [
    "refreshToken",
    "REFRESH_TOKEN",
    "refresh_token",
    "refresh",
  ];

  console.log("📱 Checking Access Tokens:");
  tokenKeys.forEach((key) => {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(
        `✅ Found token in '${key}':`,
        token.substring(0, 20) + "...",
      );

      // Try to decode JWT to check expiration
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now() / 1000;
        const isExpired = payload.exp < now;

        console.log(
          `   - Expires: ${new Date(payload.exp * 1000).toISOString()}`,
        );
        console.log(`   - Is Expired: ${isExpired ? "❌ YES" : "✅ NO"}`);
        console.log(
          `   - User: ${payload.username || payload.user_id || "Unknown"}`,
        );
      } catch (e) {
        console.log(`   - ⚠️ Cannot decode token (might not be JWT)`);
      }
    } else {
      console.log(`❌ No token found in '${key}'`);
    }
  });

  console.log("\n🔄 Checking Refresh Tokens:");
  refreshKeys.forEach((key) => {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(
        `✅ Found refresh token in '${key}':`,
        token.substring(0, 20) + "...",
      );
    } else {
      console.log(`❌ No refresh token found in '${key}'`);
    }
  });

  // Check if user is "logged in" according to your app's logic
  console.log("\n🔐 Authentication Status:");
  const hasAnyAccessToken = tokenKeys.some((key) => localStorage.getItem(key));
  const hasAnyRefreshToken = refreshKeys.some((key) =>
    localStorage.getItem(key),
  );

  console.log(`Access Token Available: ${hasAnyAccessToken ? "✅" : "❌"}`);
  console.log(`Refresh Token Available: ${hasAnyRefreshToken ? "✅" : "❌"}`);

  return {
    hasAccessToken: hasAnyAccessToken,
    hasRefreshToken: hasAnyRefreshToken,
  };
};

// Function to test API call with current auth
export const testAuthenticatedCall = async () => {
  const { fetchClient } = await import("../API/fetchClient");

  console.log("=== TESTING API CALL ===");

  try {
    const response = await fetchClient("iam/users/", {
      method: "GET",
    });

    console.log("✅ API Call successful:", response);
    return response;
  } catch (error) {
    console.log("❌ API Call failed:", error);
    return { error };
  }
};
