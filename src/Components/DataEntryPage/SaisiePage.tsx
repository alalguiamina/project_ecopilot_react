import React, { useMemo, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { User } from "../../App";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetUsers } from "../../hooks/useGetUsers";
import { useGetSaisies } from "../../hooks/useGetSaisies";
import type { Site } from "../../types/site";
import type { Saisie } from "../../types/saisie";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import SiteCard from "./SiteCard";
import SaisieItem from "./SaisieItem";
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
  const [activeTab, setActiveTab] = useState<
    "en-cours" | "validees" | "rejetees"
  >("en-cours");

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

  // Fetch all saisies for the user's accessible sites
  const { data: allSaisies, isLoading: saisiesLoading } = useGetSaisies({
    enabled: Boolean(userSites.length > 0),
  });

  // Filter saisies by status and user's accessible sites
  const filteredSaisies = useMemo(() => {
    if (!allSaisies) return { enCours: [], validees: [], rejetees: [] };

    const userSiteIds = userSites.map((site) => site.id);
    const userSaisies = allSaisies.filter((saisie) =>
      userSiteIds.includes(saisie.site),
    );

    return {
      enCours: userSaisies.filter(
        (saisie) =>
          saisie.statut === "en_attente" ||
          saisie.statut === "valide_partiellement",
      ),
      validees: userSaisies.filter((saisie) => saisie.statut === "valide"),
      rejetees: userSaisies.filter(
        (saisie) => saisie.statut === "refuse" || saisie.statut === "rejete",
      ),
    };
  }, [allSaisies, userSites]);

  // Group saisies by site for current tab
  const groupedSaisies = useMemo(() => {
    const currentSaisies =
      filteredSaisies[
        activeTab === "en-cours"
          ? "enCours"
          : activeTab === "validees"
            ? "validees"
            : "rejetees"
      ];

    const grouped: { [siteId: number]: { site: Site; saisies: Saisie[] } } = {};

    currentSaisies.forEach((saisie) => {
      const site = userSites.find((s) => s.id === saisie.site);
      if (site) {
        if (!grouped[saisie.site]) {
          grouped[saisie.site] = { site, saisies: [] };
        }
        grouped[saisie.site].saisies.push(saisie);
      }
    });

    return Object.values(grouped);
  }, [filteredSaisies, activeTab, userSites]);

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

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "valide_partiellement":
        return "Validé partiellement";
      case "valide":
        return "Validé";
      case "refuse":
      case "rejete":
        return "Rejeté";
      default:
        return status;
    }
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
    (user.role === "admin" && usersLoading) ||
    saisiesLoading
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
            <h1 className="saisie-title">Saisie de Données</h1>
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

          <div className="saisie-tabs">
            <div className="tabs-header">
              <button
                className={`tab-button ${
                  activeTab === "en-cours" ? "active" : ""
                }`}
                onClick={() => setActiveTab("en-cours")}
              >
                <Clock className="tab-icon" size={20} />
                <span className="tab-label">En Cours</span>
                <span className="tab-count">
                  {filteredSaisies.enCours.length}
                </span>
              </button>
              <button
                className={`tab-button ${
                  activeTab === "validees" ? "active" : ""
                }`}
                onClick={() => setActiveTab("validees")}
              >
                <CheckCircle className="tab-icon" size={20} />
                <span className="tab-label">Validées</span>
                <span className="tab-count">
                  {filteredSaisies.validees.length}
                </span>
              </button>
              <button
                className={`tab-button ${
                  activeTab === "rejetees" ? "active" : ""
                }`}
                onClick={() => setActiveTab("rejetees")}
              >
                <XCircle className="tab-icon" size={20} />
                <span className="tab-label">Rejetées</span>
                <span className="tab-count">
                  {filteredSaisies.rejetees.length}
                </span>
              </button>
            </div>

            <div className="tab-content">
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
              ) : filteredSaisies.enCours.length === 0 &&
                filteredSaisies.validees.length === 0 &&
                filteredSaisies.rejetees.length === 0 ? (
                // Show site creation interface when no saisies exist
                <div className="sites-creation">
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h2 className="empty-state-title">Aucune saisie trouvée</h2>
                    <p className="empty-state-message">
                      Créez votre première saisie en sélectionnant un site
                      ci-dessous.
                    </p>
                  </div>

                  <div className="sites-grid">
                    {userSites.map((site: Site) => {
                      const validators =
                        user.role === "admin"
                          ? getValidatorsForSite(site.id)
                          : undefined;

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
                </div>
              ) : groupedSaisies.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    {activeTab === "en-cours"
                      ? "⏳"
                      : activeTab === "validees"
                        ? "✅"
                        : "❌"}
                  </div>
                  <h2 className="empty-state-title">
                    {activeTab === "en-cours"
                      ? "Aucune saisie en cours"
                      : activeTab === "validees"
                        ? "Aucune saisie validée"
                        : "Aucune saisie rejetée"}
                  </h2>
                  <p className="empty-state-message">
                    {activeTab === "en-cours"
                      ? "Créez une nouvelle saisie pour commencer."
                      : activeTab === "validees"
                        ? "Aucune saisie n'a encore été validée."
                        : "Aucune saisie n'a été rejetée."}
                  </p>
                </div>
              ) : (
                <div className="saisie-groups">
                  {groupedSaisies.map(({ site, saisies }) => (
                    <div key={site.id} className="saisie-group">
                      <div className="group-header">
                        <h3 className="group-title">{site.name}</h3>
                        <span className="group-count">
                          {saisies.length} saisie{saisies.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="group-content">
                        {saisies.map((saisie) => (
                          <SaisieItem
                            key={`${site.id}-${saisie.id}`}
                            site={site}
                            saisie={saisie}
                            onEdit={handleSaisieClick}
                            creatorUser={allUsers?.find(
                              (u) => u.id === saisie.created_by,
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
