import React, { useMemo, useState } from "react";
import { Database, Building2 } from "lucide-react";
import { User } from "../../App";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetUsers } from "../../hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

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
  // Removed: No need to fetch existing saisies for a data entry page

  // Removed: Filter saisies logic - not needed for site selection

  // Removed: Group saisies logic - not needed for site selection

  // Get validators for each site
  const getValidatorsForSite = (siteId: number): ValidatorInfo[] => {
    // For admins, use the allUsers data
    if (user.role === "admin" && allUsers) {
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
        configContent: site.config_json,
      });
      setSelectedSite(site);
      setIsDialogOpen(true);
    }
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSite(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      // TODO: Implement file upload logic here
      console.log("Uploading file:", uploadedFile.name);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(`Fichier "${uploadedFile.name}" téléversé avec succès!`);
      setUploadedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Erreur lors du téléversement du fichier.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleExcelDownload = (siteId: number) => {
    // TODO: Implement Excel template download logic
    console.log("Downloading Excel template for site:", siteId);

    // Simulate download
    const site = userSites.find((s) => s.id === siteId);
    if (site) {
      alert(
        `Téléchargement du modèle Excel pour le site "${site.name}" en cours...`,
      );

      // Here you would typically:
      // 1. Call an API endpoint to generate the Excel template
      // 2. Download the file
      // Example: window.open(`/api/sites/${siteId}/excel-template`, '_blank');
    }
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
            <h1 className="saisie-title">Saisie de Données</h1>
            <p className="saisie-subtitle">
              Créez de nouvelles saisies de données pour vos sites assignés
              {user.role === "agent" &&
                ` • ${userSites.length} site${userSites.length > 1 ? "s" : ""} assigné${userSites.length > 1 ? "s" : ""}`}
              {user.role === "admin" &&
                ` • ${userSites.length} site${userSites.length > 1 ? "s" : ""} `}
            </p>
            {user.role === "agent" &&
              sitesError &&
              fallbackSites.length > 0 && (
                <div className="fallback-notice">
                  <p> Affichage des sites assignés (informations limitées)</p>
                  <p>
                    Configuration des indicateurs non disponible - contactez
                    votre administrateur
                  </p>
                </div>
              )}
          </header>

          {/* File Upload Section */}
          <div className="file-upload-section">
            <div className="upload-container">
              <div className="upload-header">
                <h3 className="upload-title">Téléverser un fichier</h3>
              </div>

              <div className="upload-area">
                {!uploadedFile ? (
                  <div className="upload-dropzone">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-input"
                      onChange={handleFileSelect}
                      accept=".xlsx,.xls,.csv,"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <div className="upload-icon">
                        <Database size={32} />
                      </div>
                      <span className="upload-text">
                        Cliquez pour sélectionner un fichier
                      </span>
                      <span className="upload-formats">
                        Formats acceptés: CSV
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="file-selected">
                    <div className="file-info">
                      <div className="file-icon">
                        <Database size={24} />
                      </div>
                      <div className="file-details">
                        <span className="file-name">{uploadedFile.name}</span>
                        <span className="file-size">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        className="btn-upload"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? "Téléversement..." : "Téléverser"}
                      </button>
                      <button
                        className="btn-remove"
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="saisie-content">
            {userSites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Building2 size={48} />
                </div>
                <h2 className="empty-state-title">Aucun site disponible</h2>
                <p className="empty-state-message">
                  {user.role === "agent"
                    ? "Aucun site ne vous a été assigné pour la saisie de données. Contactez votre administrateur."
                    : "Aucun site n'est configuré dans le système."}
                </p>
              </div>
            ) : (
              <div className="sites-creation">
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
                        onExcelDownload={handleExcelDownload}
                        userRole={user.role}
                      />
                    );
                  })}
                </div>
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
