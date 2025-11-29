import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useUpdateSiteConfig } from "../../hooks/useUpdateSiteConfig";
import { useGetPosteIndicateurs } from "../../hooks/useGetPosteIndicateurs";
import { useGetSiteConfig } from "../../hooks/useGetSiteConfig";
import type { PosteEmission } from "../../types/postesEmission";
import type { PosteIndicateur } from "../../types/postesIndicateurs";
import "./ConfigDialog.css";
import { UserComboBox } from "../UserComboBox";
import { SiteComboBox } from "../SiteComboBox";

// NEW IMPORT

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteConfig {
  siteId: number;
  postesConfig: {
    [posteId: number]: {
      indicateurs: {
        id: number;
        obligatoire: boolean;
      }[];
    };
  };
}

interface PosteIndicateursData {
  [posteId: number]: PosteIndicateur[];
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSite, setSelectedSite] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [expandedPoste, setExpandedPoste] = useState<number | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteId: 0,
    postesConfig: {},
  });
  const [posteIndicateursData, setPosteIndicateursData] =
    useState<PosteIndicateursData>({});

  const { data: sites, isLoading: sitesLoading } = useGetSites();
  const { data: postes, isLoading: postesLoading } = useGetPostesEmission();
  const updateSiteConfigMutation = useUpdateSiteConfig();

  // Load existing site configuration using the dedicated hook
  const { data: siteConfigData, isLoading: configLoading } =
    useGetSiteConfig(selectedSite);
  const existingConfig = siteConfigData?.config_json;

  // Reset all form state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSite(null);
      setSelectedUsers([]);
      setExpandedPoste(null);
      setSiteConfig({
        siteId: 0,
        postesConfig: {},
      });
      setPosteIndicateursData({});
    }
  }, [isOpen]);

  // Update the useEffect to load existing config
  useEffect(() => {
    if (!selectedSite || !postes) return;

    setSiteConfig((prev) => {
      if (
        prev.siteId === selectedSite &&
        Object.keys(prev.postesConfig).length > 0
      ) {
        return prev; // Don't reset if already loaded
      }

      const initialConfig: SiteConfig = {
        siteId: selectedSite,
        postesConfig: {},
      };

      // Initialize with empty arrays
      postes.forEach((poste) => {
        initialConfig.postesConfig[poste.id] = {
          indicateurs: [],
        };
      });

      // Use existing config_json which already contains obligatoire information
      if (existingConfig && Array.isArray(existingConfig)) {
        existingConfig.forEach((config: any) => {
          const posteId = config.poste;
          if (!initialConfig.postesConfig[posteId]) {
            initialConfig.postesConfig[posteId] = { indicateurs: [] };
          }
          // Use existing config which should have obligatoire flags
          const indicateurs = (config.indicateurs || []).map((item: any) => {
            if (typeof item === "object" && item.id !== undefined) {
              // Already has obligatoire flag
              return {
                id: item.id,
                obligatoire: Boolean(item.obligatoire),
              };
            } else {
              // Legacy format - convert to object
              return {
                id: typeof item === "number" ? item : item.id,
                obligatoire: false,
              };
            }
          });
          initialConfig.postesConfig[posteId].indicateurs = indicateurs;
        });
      }

      return initialConfig;
    });

    setPosteIndicateursData({});
  }, [selectedSite, postes, existingConfig]);

  const handleSiteSelect = (siteId: number | null) => {
    setSelectedSite(siteId);
    setExpandedPoste(null);
    // Clear poste indicateurs data when changing sites
    setPosteIndicateursData({});
  };

  const togglePosteExpansion = (posteId: number) => {
    setExpandedPoste((current) => (current === posteId ? null : posteId));
  };

  const handleIndicateurToggle = (posteId: number, indicateurId: number) => {
    setSiteConfig((prev) => {
      // ✅ DEEP COPY - This is crucial!
      const newConfig: SiteConfig = {
        siteId: prev.siteId,
        postesConfig: { ...prev.postesConfig },
      };

      // Ensure the poste config exists
      if (!newConfig.postesConfig[posteId]) {
        newConfig.postesConfig[posteId] = { indicateurs: [] };
      }

      // ✅ Create a new copy of the poste config
      const currentIndicateurs =
        newConfig.postesConfig[posteId].indicateurs || [];
      const newIndicateurs = [...currentIndicateurs];

      const index = newIndicateurs.findIndex((ind) => ind.id === indicateurId);

      if (index > -1) {
        newIndicateurs.splice(index, 1);
      } else {
        newIndicateurs.push({ id: indicateurId, obligatoire: false });
      }

      // ✅ Create entirely new object for this poste
      newConfig.postesConfig[posteId] = {
        indicateurs: newIndicateurs,
      };

      return newConfig;
    });
  };

  const handleObligatoireToggle = (posteId: number, indicateurId: number) => {
    setSiteConfig((prev) => {
      const newConfig: SiteConfig = {
        siteId: prev.siteId,
        postesConfig: { ...prev.postesConfig },
      };

      if (!newConfig.postesConfig[posteId]) return prev;

      const currentIndicateurs = [
        ...newConfig.postesConfig[posteId].indicateurs,
      ];
      const index = currentIndicateurs.findIndex(
        (ind) => ind.id === indicateurId,
      );

      if (index > -1) {
        currentIndicateurs[index] = {
          ...currentIndicateurs[index],
          obligatoire: !currentIndicateurs[index].obligatoire,
        };

        newConfig.postesConfig[posteId] = {
          indicateurs: currentIndicateurs,
        };
      }

      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!selectedSite) return;

    try {
      // Create the configs array in the format expected by the backend
      const configPayload = {
        configs: Object.entries(siteConfig.postesConfig).flatMap(
          ([posteId, config]) =>
            config.indicateurs.map((indicateur) => ({
              type_indicateur_id: indicateur.id,
              obligatoire: indicateur.obligatoire,
            })),
        ),
      };

      await updateSiteConfigMutation.mutateAsync({
        siteId: selectedSite,
        config: configPayload,
      });

      alert("Configuration sauvegardée avec succès!");
      onClose();
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Erreur lors de la sauvegarde de la configuration");
    }
  };

  const getSelectedSiteName = () => {
    if (!selectedSite || !sites) return null;
    const site = sites.find((s) => s.id === selectedSite);
    return site ? site.name : null;
  };

  if (!isOpen) return null;

  // Update isLoading check
  const isLoading = sitesLoading || postesLoading || configLoading;

  return (
    <div className="config-dialog-overlay">
      <div className="config-dialog">
        <div className="config-dialog-header">
          <div className="header-content">
            <Settings className="header-icon" size={24} />
            <div>
              <h2>Configuration des Sites</h2>
              <p>
                Configurez les postes d'émission et indicateurs pour chaque site
              </p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="config-dialog-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* Sites Selection */}
              <div className="sites-section">
                <h3>Sélectionner un site</h3>
                <div className="selection-wrapper">
                  <div className="site-select-wrapper">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Site
                    </label>
                    <SiteComboBox
                      value={selectedSite}
                      placeholder="Choisir un site..."
                      onChange={(selected) => {
                        // Handle both single and multi-select, but we only want single here
                        const siteId = Array.isArray(selected)
                          ? selected[0]
                          : selected;
                        handleSiteSelect(siteId);
                      }}
                      inputId="config-site-select"
                      isClearable={true}
                    />
                  </div>
                </div>

                {selectedSite && getSelectedSiteName() && (
                  <div className="selected-info" style={{ marginTop: "16px" }}>
                    <div className="selected-site-info">
                      <div className="site-info-card">
                        <div className="site-info-name">
                          Site: {getSelectedSiteName()}
                        </div>
                        <div className="site-info-validation">
                          {sites?.find((s) => s.id === selectedSite)
                            ?.require_double_validation
                            ? "Double validation requise"
                            : "Validation simple"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Postes and Indicateurs Configuration */}
              {selectedSite && (
                <div className="postes-section">
                  <h3>Postes d'émission et indicateurs</h3>
                  <div className="postes-list">
                    {postes?.map((poste: PosteEmission) => (
                      <PostePanel
                        key={poste.id}
                        poste={poste}
                        isExpanded={expandedPoste === poste.id}
                        onToggleExpansion={() => togglePosteExpansion(poste.id)}
                        siteConfig={siteConfig}
                        onIndicateurToggle={handleIndicateurToggle}
                        onObligatoireToggle={handleObligatoireToggle}
                        posteIndicateursData={posteIndicateursData}
                        setPosteIndicateursData={setPosteIndicateursData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="config-dialog-footer">
          <button className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!selectedSite || updateSiteConfigMutation.isPending}
          >
            {updateSiteConfigMutation.isPending
              ? "Sauvegarde..."
              : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------
// PostePanel (unchanged)
// ----------------------------------

interface PostePanelProps {
  poste: PosteEmission;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  siteConfig: SiteConfig;
  onIndicateurToggle: (posteId: number, indicateurId: number) => void;
  onObligatoireToggle: (posteId: number, indicateurId: number) => void;
  posteIndicateursData: PosteIndicateursData;
  setPosteIndicateursData: React.Dispatch<
    React.SetStateAction<PosteIndicateursData>
  >;
}

const PostePanel: React.FC<PostePanelProps> = ({
  poste,
  isExpanded,
  onToggleExpansion,
  siteConfig,
  onIndicateurToggle,
  onObligatoireToggle,
  posteIndicateursData,
  setPosteIndicateursData,
}) => {
  const {
    data: indicateurs,
    isLoading: indicateursLoading,
    error: indicateursError,
    refetch,
  } = useGetPosteIndicateurs({
    posteId: poste.id,
    enabled: isExpanded,
  });

  useEffect(() => {
    if (indicateurs) {
      setPosteIndicateursData((prev) => ({
        ...prev,
        [poste.id]: indicateurs,
      }));
    }
  }, [indicateurs, poste.id, setPosteIndicateursData]);

  const isIndicateurSelected = (indicateurId: number) => {
    return Boolean(
      siteConfig.postesConfig[poste.id]?.indicateurs?.some(
        (ind) => ind.id === indicateurId,
      ),
    );
  };

  const isIndicateurObligatoire = (indicateurId: number) => {
    const indicateur = siteConfig.postesConfig[poste.id]?.indicateurs?.find(
      (ind) => ind.id === indicateurId,
    );
    return indicateur?.obligatoire || false;
  };

  const handleRetry = () => {
    refetch();
  };

  const getSelectedIndicatorsCount = () => {
    if (!siteConfig.postesConfig[poste.id]) {
      siteConfig.postesConfig[poste.id] = { indicateurs: [] };
    }

    return siteConfig.postesConfig[poste.id]?.indicateurs.length || 0;
  };

  const getAvailableIndicatorsInfo = () => {
    const selectedCount = getSelectedIndicatorsCount();
    const availableCount = posteIndicateursData[poste.id]?.length;

    if (availableCount !== undefined) {
      return `${selectedCount}/${availableCount} sélectionné(s)`;
    }

    return `${selectedCount} sélectionné(s)`;
  };

  return (
    <div className="poste-panel">
      <button className="poste-header" onClick={onToggleExpansion}>
        <div className="poste-info">
          <span className="poste-icon">
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </span>
          <span className="poste-name">{poste.name}</span>
        </div>
        <div className="selected-count">{getAvailableIndicatorsInfo()}</div>
      </button>

      {isExpanded && (
        <div className="poste-content">
          {indicateursLoading && (
            <div className="indicateurs-loading">
              <div className="loading-spinner-small"></div>
              <span>Chargement des indicateurs pour {poste.name}...</span>
            </div>
          )}

          {indicateursError && (
            <div className="indicateurs-error">
              <div className="error-content">
                <AlertCircle size={20} className="error-icon" />
                <div className="error-details">
                  <span className="error-title">
                    Erreur lors du chargement des indicateurs
                  </span>
                  <span className="error-message">
                    {indicateursError.message}
                  </span>
                  <span className="error-poste">
                    Poste: {poste.name} (ID: {poste.id})
                  </span>
                </div>
                <button className="retry-button" onClick={handleRetry}>
                  <RefreshCw size={16} />
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {indicateurs && indicateurs.length > 0 && (
            <div className="indicateurs-grid">
              {indicateurs.map((indicateur: PosteIndicateur) => (
                <div key={indicateur.id} className="indicateur-item">
                  <label className="indicateur-checkbox">
                    <input
                      type="checkbox"
                      checked={isIndicateurSelected(indicateur.id)}
                      onChange={() =>
                        onIndicateurToggle(poste.id, indicateur.id)
                      }
                    />
                    <div className="checkbox-content">
                      <span className="indicateur-name">
                        {indicateur.code} - {indicateur.libelle}
                      </span>
                      <span className="indicateur-description">
                        Unité par défaut: {indicateur.unite_default}
                      </span>
                    </div>
                  </label>
                  {isIndicateurSelected(indicateur.id) && (
                    <label className="obligatoire-checkbox">
                      <input
                        type="checkbox"
                        checked={isIndicateurObligatoire(indicateur.id)}
                        onChange={() =>
                          onObligatoireToggle(poste.id, indicateur.id)
                        }
                      />
                      <span className="obligatoire-label">Obligatoire *</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}

          {indicateurs &&
            indicateurs.length === 0 &&
            !indicateursLoading &&
            !indicateursError && (
              <div className="no-indicateurs">
                <span>Aucun indicateur disponible pour ce poste</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
