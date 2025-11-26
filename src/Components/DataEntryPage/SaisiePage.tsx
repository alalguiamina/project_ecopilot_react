import React, { useMemo, useState } from "react";
import { User } from "../../App";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetUsers } from "../../hooks/useGetUsers";
import type { Site } from "../../types/site";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import SiteCard from "./SiteCard";
import DataEntryDialog from "./DataEntryDialog";
import "./SaisiePage.css";

interface SaisiePageProps {
  user: User;
}

interface ValidatorInfo {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export const SaisiePage = ({ user }: SaisiePageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Logout handler
  const handleLogout = () => {
    try {
      // Clear all tokens and session data
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
      console.warn("[SaisiePage] clear tokens error", e);
    }

    // Force navigation to login
    const loginUrl = `${process.env.PUBLIC_URL ?? ""}/login?loggedout=1`;
    window.location.href = loginUrl;
  };

  // Topbar configuration
  const topbarProps = {
    title: "Saisie de Données",
    userName:
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username,
    onLogout: handleLogout,
  };

  const {
    data: allSites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useGetSites();

  // Only admins can fetch all users, agents will fetch users per site
  const { data: allUsers, isLoading: usersLoading } = useGetUsers({
    enabled: user.role === "admin",
  });

  // For agents, if sites API fails, create minimal site objects from user.sites
  const fallbackSites = useMemo((): Site[] => {
    if (user.role === "agent" && sitesError && user.sites) {
      return user.sites.map(
        (siteId): Site => ({
          id: siteId,
          name: `Site ${siteId}`,
          location: "Localisation non disponible",
          require_double_validation: false, // Default assumption
          config_json: [], // Empty configuration - user will need admin to configure
        }),
      );
    }
    return [];
  }, [user, sitesError]);

  // Filter sites based on user role
  const userSites = useMemo((): Site[] => {
    // Use fallback sites for agents if main API failed
    const sitesToUse: Site[] =
      user.role === "agent" && sitesError ? fallbackSites : allSites || [];

    // Admins see all sites
    if (user.role === "admin") {
      return sitesToUse;
    }

    // Agents see only their assigned sites
    if (user.role === "agent") {
      return sitesToUse.filter((site: Site) => user.sites?.includes(site.id));
    }

    return [];
  }, [allSites, fallbackSites, user, sitesError]);

  // Get validators for each site
  const getValidatorsForSite = (siteId: number): ValidatorInfo[] => {
    // For admins, use the allUsers data
    if (user.role === "admin" && allUsers) {
      return allUsers
        .filter(
          (u) =>
            u.sites?.includes(siteId) &&
            (u.role === "user" ||
              u.role === "super_user" ||
              u.role === "admin"),
        )
        .map((u) => ({
          id: u.id,
          username: u.username,
          first_name: u.first_name,
          last_name: u.last_name,
          role: u.role,
        }));
    }

    // For agents, we'll fetch users per site in the component rendering
    // This function will be used differently for agents
    return [];
  };

  const handleSaisieClick = (siteId: number) => {
    const site = userSites.find((s) => s.id === siteId);
    if (site) {
      console.log("[SaisiePage] Opening DataEntry for site:", {
        id: site.id,
        name: site.name,
        hasConfig: !!site.config_json,
        configType: typeof site.config_json,
        configLength: Array.isArray(site.config_json)
          ? site.config_json.length
          : "not array",
      });
      setSelectedSite(site);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSite(null);
  };

  if (
    (user.role === "admin" && sitesLoading) ||
    (user.role === "admin" && usersLoading)
  ) {
    return (
      <div className="saisie-page">
        <Sidebar user={user} />
        <div className="saisie-main">
          <Topbar {...topbarProps} />
          <main className="saisie-content">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Chargement des sites...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (user.role === "admin" && sitesError) {
    return (
      <div className="saisie-page">
        <Sidebar user={user} />
        <div className="saisie-main">
          <Topbar {...topbarProps} />
          <main className="saisie-content">
            <div className="error-state">
              <div className="error-state-title">Erreur de chargement</div>
              <p>
                Impossible de charger la liste des sites. Veuillez réessayer.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="saisie-page">
      <Sidebar user={user} />
      <div className="saisie-main">
        <Topbar {...topbarProps} />
        <main className="saisie-content">
          <header className="saisie-header">
            <h1 className="saisie-title">Gestion des Sites</h1>
            <p className="saisie-subtitle">
              Gestion des validations et saisie de données par site
              {user.role === "agent" &&
                ` • ${userSites.length} site${userSites.length > 1 ? "s" : ""} assigné${userSites.length > 1 ? "s" : ""}`}
              {user.role === "admin" &&
                ` • ${userSites.length} site${userSites.length > 1 ? "s" : ""} total${userSites.length > 1 ? "aux" : ""}`}
            </p>
            {user.role === "agent" &&
              sitesError &&
              fallbackSites.length > 0 && (
                <div className="fallback-notice">
                  <p>📋 Affichage des sites assignés (informations limitées)</p>
                  <p>
                    ⚠️ Configuration des indicateurs non disponible - contactez
                    votre administrateur
                  </p>
                </div>
              )}
          </header>

          <div className="saisie-body">
            {userSites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏢</div>
                <h2 className="empty-state-title">Aucun site disponible</h2>
                <p className="empty-state-message">
                  {user.role === "agent"
                    ? "Aucun site ne vous a été assigné pour la saisie de données. Contactez votre administrateur."
                    : "Aucun site n'est configuré dans le système."}
                </p>
              </div>
            ) : (
              <div className="sites-grid">
                {userSites.map((site: Site) => {
                  // For admin, get validators using the function
                  const validators =
                    user.role === "admin"
                      ? getValidatorsForSite(site.id)
                      : undefined; // For agents, SiteCard will fetch per-site users

                  return (
                    <SiteCard
                      key={site.id}
                      site={site}
                      validators={validators}
                      onSaisieClick={handleSaisieClick}
                      userRole={user.role}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Data Entry Dialog */}
      {selectedSite && (
        <DataEntryDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          site={selectedSite}
          userRole={user.role}
        />
      )}
    </div>
  );
};

export default SaisiePage;
