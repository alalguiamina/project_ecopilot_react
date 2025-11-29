import React, { useMemo, useState } from "react";
import {
  Database,
  Building2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { User } from "../../App";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetUsers } from "../../hooks/useGetUsers";
import { useUploadCsvSaisie } from "../../hooks/useUploadCsvSaisie";
import { useDownloadCsvTemplate } from "../../hooks/useDownloadCsvTemplate";
import { useQueryClient } from "@tanstack/react-query";
import type { Site } from "../../types/site";
import type { CsvUploadResponse } from "../../types/saisie";
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
  const [selectedSiteForUpload, setSelectedSiteForUpload] = useState<
    number | null
  >(null);
  const [uploadResult, setUploadResult] = useState<CsvUploadResponse | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // CSV upload and download hooks
  const csvUploadMutation = useUploadCsvSaisie();
  const csvDownloadMutation = useDownloadCsvTemplate();

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
      // Validate file type
      const allowedExtensions = [".csv", ".xls", ".xlsx"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!allowedExtensions.includes(fileExtension)) {
        alert(
          "Type de fichier non supporté. Veuillez utiliser un fichier CSV, XLS ou XLSX.",
        );
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(
          "Le fichier est trop volumineux. Taille maximale autorisée : 10MB.",
        );
        return;
      }

      setUploadedFile(file);
      setUploadResult(null); // Clear previous upload results
    }
  };

  const handleSiteSelectForUpload = (siteId: number) => {
    setSelectedSiteForUpload(siteId);
  };

  const handleFileUpload = async () => {
    if (!uploadedFile || !selectedSiteForUpload) {
      alert("Veuillez sélectionner un fichier et un site.");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log("Starting CSV upload:", {
        siteId: selectedSiteForUpload,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type,
      });

      const result = await csvUploadMutation.mutateAsync({
        siteId: selectedSiteForUpload,
        file: uploadedFile,
      });

      setUploadResult(result);
      setUploadedFile(null);
      setSelectedSiteForUpload(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      console.log("Upload successful:", result);
    } catch (error: any) {
      console.error("Upload failed:", error);
      console.error("Error details:", {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });

      // Show more detailed error message
      const errorMessage =
        error.message || "Erreur inconnue lors du téléversement";
      alert(`Erreur lors du téléversement: ${errorMessage}`);
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

  const handleExcelDownload = async (siteId: number) => {
    const site = userSites.find((s) => s.id === siteId);
    if (!site) {
      alert("Site non trouvé.");
      return;
    }

    try {
      console.log("Downloading CSV template for site:", siteId);

      await csvDownloadMutation.mutateAsync({
        siteId,
        filename: `template_saisie_${site.name.replace(/[^a-zA-Z0-9]/g, "_")}_${siteId}.xlsx`,
      });

      // Success message handled by the hook
    } catch (error: any) {
      console.error("Download failed:", error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
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
                <h3 className="upload-title">
                  <Upload size={20} style={{ marginRight: "8px" }} />
                  Téléverser un fichier CSV
                </h3>
                <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                  Téléversez vos données de saisie via un fichier CSV, XLS ou
                  XLSX
                </p>
              </div>

              {/* Site Selection for Upload */}
              {!uploadedFile && userSites.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Sélectionnez un site:
                  </label>
                  <select
                    value={selectedSiteForUpload || ""}
                    onChange={(e) =>
                      handleSiteSelectForUpload(Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Choisir un site --</option>
                    {userSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="upload-area">
                {!uploadedFile ? (
                  <div className="upload-dropzone">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-input"
                      onChange={handleFileSelect}
                      accept=".xlsx,.xls,.csv"
                      disabled={!selectedSiteForUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`upload-label ${!selectedSiteForUpload ? "disabled" : ""}`}
                    >
                      <div className="upload-icon">
                        <Database size={32} />
                      </div>
                      <span className="upload-text">
                        {selectedSiteForUpload
                          ? "Cliquez pour sélectionner un fichier"
                          : "Sélectionnez d'abord un site"}
                      </span>
                      <span className="upload-formats">
                        Formats acceptés: CSV, XLS, XLSX (max 10MB)
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
                        {selectedSiteForUpload && (
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            Site:{" "}
                            {
                              userSites.find(
                                (s) => s.id === selectedSiteForUpload,
                              )?.name
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        className="btn-upload"
                        onClick={handleFileUpload}
                        disabled={isUploading || !selectedSiteForUpload}
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

              {/* Upload Results */}
              {uploadResult && (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      padding: "15px",
                      borderRadius: "5px",
                      backgroundColor: uploadResult.errors?.length
                        ? "#fee"
                        : "#efe",
                      border: `1px solid ${uploadResult.errors?.length ? "#fcc" : "#cfc"}`,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: uploadResult.errors?.length ? "#c33" : "#3a3",
                      }}
                    >
                      {uploadResult.errors?.length ? (
                        <>
                          <AlertCircle size={20} /> Téléversement avec erreurs
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} /> Téléversement réussi
                        </>
                      )}
                    </h4>

                    <p style={{ margin: "5px 0", fontSize: "14px" }}>
                      {uploadResult.message}
                    </p>

                    {(uploadResult.created_saisies ||
                      uploadResult.updated_saisies) && (
                      <div style={{ fontSize: "14px", marginTop: "10px" }}>
                        {uploadResult.created_saisies && (
                          <p style={{ margin: "2px 0", color: "#3a3" }}>
                            ✓ {uploadResult.created_saisies} nouvelle(s)
                            saisie(s) créée(s)
                          </p>
                        )}
                        {uploadResult.updated_saisies && (
                          <p style={{ margin: "2px 0", color: "#3a3" }}>
                            ✓ {uploadResult.updated_saisies} saisie(s) mise(s) à
                            jour
                          </p>
                        )}
                      </div>
                    )}

                    {uploadResult.warnings?.length ? (
                      <div style={{ marginTop: "10px" }}>
                        <h5 style={{ margin: "5px 0", color: "#f90" }}>
                          ⚠️ Avertissements ({uploadResult.warnings.length}):
                        </h5>
                        <div
                          style={{
                            maxHeight: "100px",
                            overflowY: "auto",
                            fontSize: "12px",
                          }}
                        >
                          {uploadResult.warnings.map((warning, index) => (
                            <p
                              key={index}
                              style={{ margin: "2px 0", color: "#f90" }}
                            >
                              Ligne {warning.row}: {warning.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {uploadResult.errors?.length ? (
                      <div style={{ marginTop: "10px" }}>
                        <h5 style={{ margin: "5px 0", color: "#c33" }}>
                          ❌ Erreurs ({uploadResult.errors.length}):
                        </h5>
                        <div
                          style={{
                            maxHeight: "100px",
                            overflowY: "auto",
                            fontSize: "12px",
                          }}
                        >
                          {uploadResult.errors.map((error, index) => (
                            <p
                              key={index}
                              style={{ margin: "2px 0", color: "#c33" }}
                            >
                              Ligne {error.row}: {error.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
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
                        isDownloading={csvDownloadMutation.isPending}
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
