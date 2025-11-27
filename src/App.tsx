import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

import Dashboard from "./Components/Dashboard/Dashboard";

import ESGIndicatorsPage from "./Components/ESGIndicatorsPage/ESGIndicatorsPage";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import OrganisationPage from "Components/OrganisationPage/OrganisationPage";
import Topbar from "Components/Topbar/Topbar";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "./hooks/useAuthToken";
import { useGetCurrentUser } from "./hooks";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

import type { User as BackendUser } from "./types/user";
import Login from "Components/Login/Login";
import Sidebar from "./Components/Sidebar/Sidebar";

import CarbonFootprintPage from "Components/CarbonFootprintPage/CarbonFootprintPage";
import CanevasPage from "Components/DataEntryPage/CanevasPage";
import SaisiePage from "Components/DataEntryPage/SaisiePage";

export type UserRole = "agent" | "user" | "superuser" | "admin";

// Replace the local User shape with an alias to the backend type
export type User = BackendUser;

function App() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loginMutation = useAuthToken();
  const { refetch } = useGetCurrentUser({ enabled: false });

  // on startup, force user to login (no auto-login)
  const { data: currentUser } = useGetCurrentUser({ enabled: false }); // Fetch current user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(
          "[App] startup - clearing any existing tokens to force login",
        );
        // Always clear tokens on startup to force fresh login
        [
          "authToken",
          "ACCESS_TOKEN",
          "access_token",
          "auth_token",
          "refreshToken",
          "REFRESH_TOKEN",
          "refresh_token",
        ].forEach((k) => localStorage.removeItem(k));

        // Clear session storage flags
        sessionStorage.removeItem("loggedOut");

        // Always start with no user to force login
        setUser(null);
        (window as any).__CURRENT_USER__ = null;
      } catch (error) {
        console.warn("[App] startup clear failed:", error);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []); // run once on mount

  // when current-user query returns, store it in App state
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const handleLogin = async (
    username: string,
    password: string,
  ): Promise<void> => {
    try {
      console.log("[App] Starting login process for:", username);

      // Clear any existing tokens first
      [
        "authToken",
        "ACCESS_TOKEN",
        "access_token",
        "auth_token",
        "refreshToken",
        "REFRESH_TOKEN",
        "refresh_token",
      ].forEach((k) => localStorage.removeItem(k));

      // perform login (gets tokens)
      const resp = await loginMutation.mutateAsync({ username, password });

      console.log("[App] Login response received:", {
        hasAccess: !!resp.access,
        hasRefresh: !!resp.refresh,
      });

      // store tokens under common keys so fetchClient can pick them up
      const access = resp.access ?? resp.token ?? resp.access_token;
      const refresh = resp.refresh ?? resp.refresh_token;

      if (access) {
        localStorage.setItem("authToken", access);
        localStorage.setItem(ACCESS_TOKEN ?? "ACCESS_TOKEN", access);
        console.log("[App] Access token stored");
      }

      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem(REFRESH_TOKEN ?? "REFRESH_TOKEN", refresh);
        console.log("[App] Refresh token stored");
      }

      // Always try to fetch user data after successful login
      console.log("[App] Fetching user data after login");
      const userRes = await refetch();
      if (userRes.data) {
        console.log("[App] User data fetched successfully:", {
          id: userRes.data.id,
          username: userRes.data.username,
          role: userRes.data.role,
          sites: userRes.data.sites,
        });
        setUser(userRes.data);
        (window as any).__CURRENT_USER__ = userRes.data;
      } else {
        console.error("[App] Failed to fetch user data after login");
        throw new Error("Failed to fetch user data after login");
      }
    } catch (err: any) {
      console.error("Login failed in App.handleLogin:", err);
      // Clear tokens on login failure
      [
        "authToken",
        "ACCESS_TOKEN",
        "access_token",
        "auth_token",
        "refreshToken",
        "REFRESH_TOKEN",
        "refresh_token",
      ].forEach((k) => localStorage.removeItem(k));
      setUser(null);
      throw err;
    }
  };

  const handleLogout = () => {
    // synchronous aggressive logout to avoid any SPA redirect race
    try {
      [
        "authToken",
        "ACCESS_TOKEN",
        "access_token",
        "auth_token",
        "refreshToken",
        "REFRESH_TOKEN",
        "refresh_token",
      ].forEach((k) => localStorage.removeItem(k));
      sessionStorage.setItem("loggedOut", "1");
    } catch (e) {
      console.warn("[App] clear tokens error", e);
    }

    try {
      queryClient.cancelQueries();
      queryClient.clear();
    } catch (e) {
      console.warn("[App] queryClient clear error", e);
    }

    setUser(null);
    (window as any).__CURRENT_USER__ = null;

    // force a full navigation (no SPA history) to /login
    const loginUrl = `${process.env.PUBLIC_URL ?? ""}/login?loggedout=1`;
    window.location.href = loginUrl;
  };

  // render Sidebar only when route is not /login
  const LocationAwareSidebar = () => {
    const location = useLocation();
    // hide sidebar on login page (and any subpath starting with /login)
    if (location.pathname.startsWith("/login")) return null;
    return <Sidebar user={user!} />;
  };

  if (initializing) {
    // TODO: render a loading indicator or placeholder
    return null;
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App" style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organisation"
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <OrganisationPage user={user!} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/data-entry/canevas"
              element={
                <ProtectedRoute
                  user={user}
                  requiredRole={["user", "superuser", "admin"]}
                >
                  <CanevasPage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-entry/validation"
              element={
                <ProtectedRoute user={user} requiredRole={["agent", "admin"]}>
                  <SaisiePage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carbon"
              element={
                <ProtectedRoute user={user}>
                  <CarbonFootprintPage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/esg"
              element={
                <ProtectedRoute user={user}>
                  <ESGIndicatorsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
