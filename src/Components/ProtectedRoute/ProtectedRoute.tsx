import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
// import default export from jwt-decode
import { jwtDecode } from "jwt-decode";
import api from "../../api";
// use the same keys your auth hook stores (authToken / refreshToken)
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../../constants";
import type { User } from "../../App";

type ProtectedRouteProps = {
  user: User | null;
  requiredRole?: string;
  children: React.ReactElement;
};

const ProtectedRoute = ({
  user,
  requiredRole,
  children,
}: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      if (requiredRole && user.role !== requiredRole) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    const runAuth = async () => {
      try {
        await auth();
      } catch {
        setIsAuthorized(false);
      }
    };

    runAuth();
  }, [user, requiredRole]);

  const refreshToken = async () => {
    // use same storage key as your auth hook (fallback to constant if defined)
    const refresh =
      localStorage.getItem(REFRESH_TOKEN) ??
      localStorage.getItem("refreshToken");
    if (!refresh) {
      setIsAuthorized(false);
      return;
    }

    try {
      // use the refresh endpoint that your backend exposes
      const res = await api.post("/token/refresh/", {
        refresh,
      });

      if (res.status === 200 && res.data?.access) {
        // store under the same key your auth flow uses
        localStorage.setItem(ACCESS_TOKEN ?? "authToken", res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("refreshToken error", error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token =
      localStorage.getItem(ACCESS_TOKEN) ??
      localStorage.getItem("authToken") ??
      null;

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const tokenExpiration = decoded?.exp ?? 0;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error("auth decode error", err);
      await refreshToken();
    }
  };

  if (isAuthorized === null) return <div>Loading...</div>;

  if (!isAuthorized) {
    console.log("[ProtectedRoute] no user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
