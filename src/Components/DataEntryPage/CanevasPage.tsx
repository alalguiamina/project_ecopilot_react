import { useState, useMemo } from "react";
import "./CanevasPage.css";
import Sidebar from "../Sidebar/Sidebar";
import { User } from "App";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "hooks/usePageTitle";
import Topbar from "Components/Topbar/Topbar";
import { ConfigDialog } from "../ConfigDialog/ConfigDialog";
import { Settings, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetUsers } from "../../hooks/useGetUsers";
import { useGetSaisies } from "../../hooks/useGetSaisies";
import type { Site } from "../../types/site";
import type { Saisie } from "../../types/saisie";
import SaisieCard from "./SaisieCard";

interface ValidatorInfo {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export const CanevasPage = ({ user }: { user?: User }) => {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "en-cours" | "validees" | "rejetees"
  >("en-cours");

  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  // Fetch all saisies
  const {
    data: allSaisies,
    isLoading: saisiesLoading,
    error: saisiesError,
    refetch: refetchSaisies,
  } = useGetSaisies();

  // Fetch sites and users
  const { data: allSites } = useGetSites();
  const { data: allUsers } = useGetUsers({
    enabled: true, // Always fetch users to show proper names in cards
  });

  // Filter saisies based on user role and permissions
  const userSaisies = useMemo(() => {
    if (!allSaisies || !user) return [];

    // Admins see all saisies
    if (user.role === "admin") {
      return allSaisies;
    }

    // Other users see only saisies for their assigned sites
    return allSaisies.filter((saisie: Saisie) =>
      user.sites?.includes(saisie.site),
    );
  }, [allSaisies, user]);

  // Filter saisies by status and user's accessible sites
  const filteredSaisies = useMemo(() => {
    if (!userSaisies) return { enCours: [], validees: [], rejetees: [] };

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
  }, [userSaisies]);

  // Get site information - moved before groupedSaisies to fix initialization error
  const getSiteById = (siteId: number): Site | undefined => {
    return allSites?.find((site) => site.id === siteId);
  };

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
      const site = getSiteById(saisie.site);
      if (site) {
        if (!grouped[saisie.site]) {
          grouped[saisie.site] = { site, saisies: [] };
        }
        grouped[saisie.site].saisies.push(saisie);
      }
    });

    return Object.values(grouped);
  }, [filteredSaisies, activeTab, allSites]);

  // Get user information by ID
  const getUserById = (userId: number) => {
    if (!allUsers) return null;
    return allUsers.find((u) => u.id === userId);
  };

  // Get validators for each site
  const getValidatorsForSite = (siteId: number): ValidatorInfo[] => {
    if (user?.role === "admin" && allUsers) {
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

  const pageTitle = usePageTitle();
  const topbarProps = {
    title: pageTitle,
    userName: user?.username ?? "User",
    onLogout: handleLogout,
  };

  return (
    <div className="saisie-page">
      <Sidebar user={user!} />
      <div className="saisie-main">
        <Topbar {...topbarProps} />
        <main className="saisie-content">
          <header className="saisie-header">
            <h1 className="saisie-title">Validation des Saisies</h1>
            <p className="saisie-subtitle">
              Consultez et validez les saisies de données RSE
              {userSaisies.length > 0 &&
                ` • ${userSaisies.length} saisie${userSaisies.length > 1 ? "s" : ""} trouvée${userSaisies.length > 1 ? "s" : ""}`}
            </p>

            <div className="page-actions">
              <button
                className="config-button"
                onClick={() => setIsConfigDialogOpen(true)}
                title="Configuration des sites"
              >
                <Settings size={20} />
                Configuration
              </button>

              <button
                className="refresh-button"
                onClick={() => refetchSaisies()}
                title="Actualiser les données"
                disabled={saisiesLoading}
              >
                <RefreshCw size={20} />
                Actualiser
              </button>
            </div>
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
              {saisiesLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Chargement des saisies...</span>
                </div>
              ) : saisiesError ? (
                <div className="error-state">
                  <div className="error-state-title">Erreur de chargement</div>
                  <p>Impossible de charger les saisies. Veuillez réessayer.</p>
                  <button onClick={() => refetchSaisies()}>Réessayer</button>
                </div>
              ) : groupedSaisies.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    {activeTab === "en-cours" ? (
                      <Clock size={48} />
                    ) : activeTab === "validees" ? (
                      <CheckCircle size={48} />
                    ) : (
                      <XCircle size={48} />
                    )}
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
                      ? "Aucune saisie en attente ou partiellement validée."
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
                          <SaisieCard
                            key={`${site.id}-${saisie.id}`}
                            site={site}
                            saisie={saisie}
                            validators={getValidatorsForSite(site.id)}
                            userRole={user?.role || "agent"}
                            creatorUser={
                              getUserById(saisie.created_by) || undefined
                            }
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

      {/* CONFIGURATION DIALOG */}
      <ConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
      />
    </div>
  );
};

export default CanevasPage;
