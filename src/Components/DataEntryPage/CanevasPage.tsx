import { useState, useMemo } from "react";
import "./CanevasPage.css";
import Sidebar from "../Sidebar/Sidebar";
import { User } from "App";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "hooks/usePageTitle";
import Topbar from "Components/Topbar/Topbar";
import { ConfigDialog } from "../ConfigDialog/ConfigDialog";
import { Settings, RefreshCw } from "lucide-react";
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
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined,
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  // Fetch all saisies
  const {
    data: allSaisies,
    isLoading: saisiesLoading,
    error: saisiesError,
    refetch: refetchSaisies,
  } = useGetSaisies({
    mois: selectedMonth,
    annee: selectedYear,
  });

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
      let filtered = allSaisies;

      // Apply status filter if selected
      if (selectedStatus) {
        filtered = filtered.filter(
          (saisie) => saisie.statut === selectedStatus,
        );
      }

      return filtered;
    }

    // Other users see only saisies for their assigned sites
    let filtered = allSaisies.filter((saisie: Saisie) =>
      user.sites?.includes(saisie.site),
    );

    // Apply status filter if selected
    if (selectedStatus) {
      filtered = filtered.filter((saisie) => saisie.statut === selectedStatus);
    }

    return filtered;
  }, [allSaisies, user, selectedStatus]);

  // Group saisies by site
  const saisiesBySite = useMemo(() => {
    const grouped: { [siteId: number]: Saisie[] } = {};
    userSaisies.forEach((saisie) => {
      if (!grouped[saisie.site]) {
        grouped[saisie.site] = [];
      }
      grouped[saisie.site].push(saisie);
    });
    return grouped;
  }, [userSaisies]);

  // Get site information
  const getSiteById = (siteId: number): Site | undefined => {
    return allSites?.find((site) => site.id === siteId);
  };

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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const getStatusOptions = () => [
    { value: "", label: "Tous les statuts" },
    { value: "en_attente", label: "En attente" },
    { value: "valide_partiellement", label: "Validé partiellement" },
    { value: "valide", label: "Validé" },
    { value: "rejete", label: "Rejeté" },
  ];

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

          <div className="saisie-body">
            {/* FILTERS */}
            <div className="filters-section">
              <div className="filters-row">
                <div className="filter-group">
                  <label htmlFor="month-filter">Mois</label>
                  <select
                    id="month-filter"
                    value={selectedMonth || ""}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  >
                    <option value="">Tous les mois</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleDateString("fr-FR", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="year-filter">Année</label>
                  <select
                    id="year-filter"
                    value={selectedYear || ""}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  >
                    <option value="">Toutes les années</option>
                    {generateYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="status-filter">Statut</label>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {getStatusOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CONTENT */}
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
            ) : Object.keys(saisiesBySite).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h2 className="empty-state-title">Aucune saisie trouvée</h2>
                <p className="empty-state-message">
                  Aucune saisie ne correspond aux critères sélectionnés.
                </p>
              </div>
            ) : (
              <div className="sites-grid">
                {Object.entries(saisiesBySite).map(([siteId, saisies]) => {
                  const site = getSiteById(Number(siteId));
                  const validators = getValidatorsForSite(Number(siteId));

                  if (!site) return null;

                  return saisies.map((saisie) => {
                    const creatorUser = getUserById(saisie.created_by);
                    return (
                      <SaisieCard
                        key={`${site.id}-${saisie.id}`}
                        site={site}
                        saisie={saisie}
                        validators={validators}
                        userRole={user?.role || "agent"}
                        creatorUser={creatorUser}
                      />
                    );
                  });
                })}
              </div>
            )}
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
