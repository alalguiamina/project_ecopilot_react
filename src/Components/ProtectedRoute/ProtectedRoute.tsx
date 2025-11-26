import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { User } from "../../App";

type ProtectedRouteProps = {
  user: User | null;
  requiredRole?: string | string[];
  children: React.ReactElement;
};

const ProtectedRoute = ({
  user,
  requiredRole,
  children,
}: ProtectedRouteProps) => {
  console.log(
    "[ProtectedRoute] checking access - user:",
    user,
    "requiredRole:",
    requiredRole,
  );

  // If no user, redirect to login immediately
  if (!user) {
    console.log("[ProtectedRoute] no user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
      console.log(
        `[ProtectedRoute] Access denied. User role: ${user.role}, Required: ${allowedRoles.join(", ")}`,
      );

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
            color: "#ef4444",
          }}
        >
          <h2>Access Denied</h2>
          <p>
            You need {allowedRoles.join(" or ")} privileges to access this page.
          </p>
          <p>
            Your current role: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
          <button
            onClick={() => {
              // Force logout to clear everything
              [
                "authToken",
                "ACCESS_TOKEN",
                "access_token",
                "auth_token",
                "refreshToken",
                "REFRESH_TOKEN",
                "refresh_token",
              ].forEach((k) => localStorage.removeItem(k));
              window.location.href = "/login";
            }}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      );
    }
  }

  console.log(`[ProtectedRoute] Access granted. User role: ${user.role}`);
  return children;
};

export default ProtectedRoute;
