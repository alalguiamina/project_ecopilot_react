import { useState, useMemo } from "react";
import "./CanevasPage.css";
import Sidebar from "../Sidebar/Sidebar";
import type { User as BackendUser } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "hooks/usePageTitle";
import Topbar from "Components/Topbar/Topbar";
import { ConfigDialog } from "../ConfigDialog/ConfigDialog";
import {
  Settings,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
} from "lucide-react";
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

export const CanevasPage = ({ user }: { user: BackendUser }) => {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "en-cours" | "validees" | "rejetees"
  >("en-cours");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  // Toggle expand state for a site group
  const toggleGroupExpand = (siteId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  // Fetch sites and users based on user role
  const {
    data: allSites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useGetSites();

  // Load all users to get creator names - needed for all roles to display creator info
  const { data: allUsers } = useGetUsers({
    enabled: Boolean(user?.role), // Enable for all authenticated users to get creator names
  });

  // For non-admin users, if sites API fails, create minimal site objects from user.sites
  const fallbackSites = useMemo((): Site[] => {
    if (
      (user?.role === "user" || user?.role === "superuser") &&
      sitesError &&
      user.sites
    ) {
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
    // Use fallback sites for non-admin users if main API failed
    const sitesToUse: Site[] =
      (user?.role === "user" || user?.role === "superuser") && sitesError
        ? fallbackSites
        : allSites || [];

    // Admins see all sites
    if (user?.role === "admin") {
      return sitesToUse;
    }

    // Users and superusers see only their assigned sites
    if (user?.role === "user" || user?.role === "superuser") {
      return sitesToUse.filter((site: Site) => user.sites?.includes(site.id));
    }

    return [];
  }, [allSites, fallbackSites, user, sitesError]);

  // Fetch all saisies for the user's accessible sites
  const {
    data: allSaisies,
    isLoading: saisiesLoading,
    error: saisiesError,
    refetch: refetchSaisies,
  } = useGetSaisies({
    enabled: Boolean(userSites.length > 0 && user?.role),
  });

  // Filter saisies based on user role and permissions
  const userSaisies = useMemo(() => {
    if (!allSaisies || !user) {
      console.log("[CanevasPage] No saisies or user available");
      return [];
    }

    console.log("[CanevasPage] Filtering saisies:", {
      totalSaisies: allSaisies.length,
      userRole: user.role,
      userSites: user.sites,
      saisiesPreview: allSaisies
        .slice(0, 3)
        .map((s) => ({ id: s.id, site: s.site, statut: s.statut })),
    });

    // Admins see all saisies
    if (user.role === "admin") {
      console.log("[CanevasPage] Admin user - showing all saisies");
      return allSaisies;
    }

    // Users and superusers see only saisies for their assigned sites
    if (user.role === "user" || user.role === "superuser") {
      if (!user.sites || user.sites.length === 0) {
        console.log("[CanevasPage] User has no assigned sites");
        return [];
      }

      const filteredSaisies = allSaisies.filter((saisie: Saisie) =>
        user.sites?.includes(saisie.site),
      );

      console.log("[CanevasPage] Filtered saisies for user:", {
        originalCount: allSaisies.length,
        filteredCount: filteredSaisies.length,
        userSites: user.sites,
      });

      return filteredSaisies;
    }

    // If the user has any other role, they shouldn't see anything
    console.log("[CanevasPage] User role not authorized:", user.role);
    return [];
  }, [allSaisies, user]);

  // Filter saisies by status for all tabs
  const filteredSaisies = useMemo(() => {
    if (!userSaisies) {
      console.log("[CanevasPage] No userSaisies available");
      return { enCours: [], validees: [], rejetees: [] };
    }

    const result = {
      enCours: userSaisies.filter(
        (saisie: Saisie) =>
          saisie.statut === "en_attente" ||
          saisie.statut === "en_cours" ||
          saisie.statut === "valide_partiellement",
      ),
      validees: userSaisies.filter(
        (saisie: Saisie) => saisie.statut === "valide",
      ),
      rejetees: userSaisies.filter(
        (saisie: Saisie) =>
          saisie.statut === "refuse" || saisie.statut === "rejete",
      ),
    };

    console.log("[CanevasPage] Filtered saisies by status:", {
      totalUserSaisies: userSaisies.length,
      enCours: result.enCours.length,
      validees: result.validees.length,
      rejetees: result.rejetees.length,
      saisiesStatuses: userSaisies.map((s) => ({ id: s.id, statut: s.statut })),
    });

    return result;
  }, [userSaisies]);

  // Get site information - moved before groupedSaisies to fix initialization error
  const getSiteById = (siteId: number): Site | undefined => {
    if (!allSites || allSites.length === 0) {
      console.log(
        `[CanevasPage] No sites loaded yet when looking for site ${siteId}`,
      );
      return undefined;
    }
    const site = allSites.find((site) => site.id === siteId);
    if (!site) {
      console.log(
        `[CanevasPage] Site ${siteId} not found in available sites:`,
        allSites.map((s) => ({ id: s.id, name: s.name })),
      );
    }
    return site;
  };

  // Group content based on active tab
  const tabContent = useMemo(() => {
    // Filter function for search
    const filterGroupsBySearch = (
      groups: { site: Site; saisies: Saisie[] }[],
    ) => {
      if (!searchTerm.trim()) return groups;

      return groups.filter(
        (group) =>
          group.site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.site.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    };

    if (activeTab === "en-cours") {
      // For "en-cours", show saisies with en_attente/en_cours status grouped by site
      const currentSaisies = filteredSaisies.enCours;

      console.log("[CanevasPage] Grouping saisies for en-cours tab:", {
        activeTab,
        currentSaisiesCount: currentSaisies.length,
        currentSaisies: currentSaisies.map((s: Saisie) => ({
          id: s.id,
          site: s.site,
          statut: s.statut,
        })),
        availableSites: allSites?.map((s) => ({ id: s.id, name: s.name })),
      });

      const grouped: { [siteId: number]: { site: Site; saisies: Saisie[] } } =
        {};

      currentSaisies.forEach((saisie: Saisie) => {
        const site = getSiteById(saisie.site);
        console.log(
          `[CanevasPage] Processing saisie ${saisie.id} for site ${saisie.site}:`,
          {
            siteFound: !!site,
            siteName: site?.name,
          },
        );

        if (site) {
          if (!grouped[saisie.site]) {
            grouped[saisie.site] = { site, saisies: [] };
          }
          grouped[saisie.site].saisies.push(saisie);
        } else {
          console.warn(
            `[CanevasPage] Site ${saisie.site} not found for saisie ${saisie.id}`,
          );
        }
      });

      const groupedData = Object.values(grouped);
      const filteredGroupedData = filterGroupsBySearch(groupedData);

      console.log("[CanevasPage] Grouped result for en-cours:", {
        groupCount: filteredGroupedData.length,
        groups: filteredGroupedData.map((g) => ({
          siteId: g.site.id,
          siteName: g.site.name,
          saisiesCount: g.saisies.length,
        })),
      });

      return {
        type: "saisies" as const,
        data: filteredGroupedData,
        count: currentSaisies.length,
      };
    } else {
      // For validees/rejetees, show saisies grouped by site
      const currentSaisies =
        filteredSaisies[activeTab === "validees" ? "validees" : "rejetees"];

      console.log("[CanevasPage] Grouping saisies:", {
        activeTab,
        currentSaisiesCount: currentSaisies.length,
        currentSaisies: currentSaisies.map((s: Saisie) => ({
          id: s.id,
          site: s.site,
          statut: s.statut,
        })),
        availableSites: allSites?.map((s) => ({ id: s.id, name: s.name })),
      });

      const grouped: { [siteId: number]: { site: Site; saisies: Saisie[] } } =
        {};

      currentSaisies.forEach((saisie: Saisie) => {
        const site = getSiteById(saisie.site);
        console.log(
          `[CanevasPage] Processing saisie ${saisie.id} for site ${saisie.site}:`,
          {
            siteFound: !!site,
            siteName: site?.name,
          },
        );

        if (site) {
          if (!grouped[saisie.site]) {
            grouped[saisie.site] = { site, saisies: [] };
          }
          grouped[saisie.site].saisies.push(saisie);
        } else {
          console.warn(
            `[CanevasPage] Site ${saisie.site} not found for saisie ${saisie.id}`,
          );
        }
      });

      const groupedData = Object.values(grouped);
      const filteredGroupedData = filterGroupsBySearch(groupedData);

      console.log("[CanevasPage] Grouped result:", {
        groupCount: filteredGroupedData.length,
        groups: filteredGroupedData.map((g) => ({
          siteId: g.site.id,
          siteName: g.site.name,
          saisiesCount: g.saisies.length,
        })),
      });

      return {
        type: "saisies" as const,
        data: filteredGroupedData,
        count: currentSaisies.length,
      };
    }
  }, [activeTab, filteredSaisies, getSiteById, searchTerm]);

  // Get user information by ID
  const getUserById = (userId: number) => {
    if (!allUsers) {
      console.log(`[CanevasPage] allUsers not loaded yet for user ${userId}`);
      return null;
    }
    const user = allUsers.find((u) => u.id === userId);
    if (!user) {
      console.log(
        `[CanevasPage] User ${userId} not found in users list:`,
        allUsers.map((u) => ({
          id: u.id,
          username: u.username,
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        })),
      );
    }
    return user;
  };

  // Get validators for each site
  const getValidatorsForSite = (siteId: number): ValidatorInfo[] => {
    if (user?.role === "admin" && allUsers) {
      return allUsers
        .filter(
          (u) =>
            u.sites?.includes(siteId) &&
            (u.role === "user" || u.role === "superuser" || u.role === "admin"),
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
              {activeTab === "en-cours"
                ? filteredSaisies.enCours.length > 0 &&
                  ` • ${filteredSaisies.enCours.length} saisie${filteredSaisies.enCours.length > 1 ? "s" : ""} en cours`
                : userSaisies.length > 0 &&
                  ` • ${userSaisies.length} saisie${userSaisies.length > 1 ? "s" : ""} trouvée${userSaisies.length > 1 ? "s" : ""}`}
            </p>

            <div className="page-actions">
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher par nom de site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {user?.role === "admin" && (
                <button
                  className="config-button"
                  onClick={() => setIsConfigDialogOpen(true)}
                  title="Configuration des sites"
                >
                  <Settings size={20} />
                  Configuration
                </button>
              )}

              <button
                className="refresh-button"
                onClick={() => refetchSaisies()}
                title="Actualiser "
                disabled={saisiesLoading}
              >
                <RefreshCw
                  size={20}
                  className={saisiesLoading ? "animate-spin" : ""}
                />
                {saisiesLoading ? "Actualisation..." : "Actualiser"}
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
              ) : tabContent.count === 0 ? (
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
                      ? "Aucune saisie n'est en cours de validation."
                      : activeTab === "validees"
                        ? "Aucune saisie n'a encore été validée."
                        : "Aucune saisie n'a été rejetée."}
                  </p>
                </div>
              ) : (
                <div className="saisie-groups">
                  {/* Render saisies grouped by site for all tabs */}
                  {tabContent.data.map(({ site, saisies }) => {
                    const isExpanded = expandedGroups.has(site.id);

                    return (
                      <div
                        key={site.id}
                        className={`saisie-group ${!isExpanded ? "collapsed" : ""}`}
                      >
                        <div
                          className="group-header"
                          onClick={() => toggleGroupExpand(site.id)}
                        >
                          <div className="group-header-content">
                            <ChevronDown className="expand-icon" size={16} />
                            <h3 className="group-title">{site.name}</h3>
                          </div>
                          <span className="group-count">
                            {saisies.length} saisie
                            {saisies.length > 1 ? "s" : ""}
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
                    );
                  })}
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
