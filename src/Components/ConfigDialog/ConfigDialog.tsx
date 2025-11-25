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
import type { Site } from "../../types/site";
import type { PosteEmission } from "../../types/postesEmission";
import type { PosteIndicateur } from "../../types/postesIndicateurs";
import "./ConfigDialog.css";
import SearchableCombobox from "Components/SearchableCombobox";

// NEW IMPORT

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SiteConfig {
  siteId: number;
  postesConfig: {
    [posteId: number]: {
      indicateurs: number[];
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
  const [expandedPostes, setExpandedPostes] = useState<Set<number>>(new Set());
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteId: 0,
    postesConfig: {},
  });
  const [posteIndicateursData, setPosteIndicateursData] =
    useState<PosteIndicateursData>({});

  const { data: sites, isLoading: sitesLoading } = useGetSites();
  const { data: postes, isLoading: postesLoading } = useGetPostesEmission();
  const updateSiteConfigMutation = useUpdateSiteConfig();

  // Load existing site configuration
  const { data: existingConfig, isLoading: configLoading } =
    useGetSiteConfig(selectedSite);

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

      // If we have existing config from backend, populate it
      if (
        existingConfig &&
        typeof existingConfig === "object" &&
        "configs" in existingConfig &&
        Array.isArray(existingConfig.configs)
      ) {
        existingConfig.configs.forEach((config: any) => {
          const posteId = config.poste_emission_id;
          if (!initialConfig.postesConfig[posteId]) {
            initialConfig.postesConfig[posteId] = { indicateurs: [] };
          }
          initialConfig.postesConfig[posteId].indicateurs.push(
            config.type_indicateur_id,
          );
        });
      }

      return initialConfig;
    });

    setPosteIndicateursData({});
  }, [selectedSite, postes, existingConfig]);

  const handleSiteSelect = (siteId: number) => {
    setSelectedSite(siteId);
    setExpandedPostes(new Set());
  };

  const togglePosteExpansion = (posteId: number) => {
    const newExpanded = new Set(expandedPostes);
    if (newExpanded.has(posteId)) {
      newExpanded.delete(posteId);
    } else {
      newExpanded.add(posteId);
    }
    setExpandedPostes(newExpanded);
  };

  const handleIndicateurToggle = (posteId: number, indicateurId: number) => {
    console.log("🔄 Toggle called:", { posteId, indicateurId });

    setSiteConfig((prev) => {
      console.log("📊 Previous state:", prev);

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

      const index = newIndicateurs.indexOf(indicateurId);
      console.log("@Index of indicateur:", index);

      if (index > -1) {
        newIndicateurs.splice(index, 1);
        console.log("@Removed indicateur");
      } else {
        newIndicateurs.push(indicateurId);
        console.log("@Added indicateur");
      }

      // ✅ Create entirely new object for this poste
      newConfig.postesConfig[posteId] = {
        indicateurs: newIndicateurs,
      };

      console.log("@New state:", newConfig);
      console.log("@New indicateurs for poste", posteId, ":", newIndicateurs);

      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!selectedSite) return;

    try {
      const configPayload = {
        configs: Object.entries(siteConfig.postesConfig).flatMap(
          ([posteId, config]) =>
            config.indicateurs.map((indicateurId) => ({
              type_indicateur_id: indicateurId,
              poste_emission_id: parseInt(posteId),
              obligatoire: true,
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
      console.error("Error saving configuration:", error);
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
                <div className="site-select-wrapper">
                  {/* ✅ REPLACED <select> WITH SEARCHABLE COMBOBOX */}
                  <SearchableCombobox
                    items={(sites || []).map((site) => ({
                      value: site.id,
                      label: site.name,
                    }))}
                    value={selectedSite}
                    placeholder="Choisir un site..."
                    onChange={(id: any) => handleSiteSelect(Number(id))}
                  />
                </div>

                {selectedSite && getSelectedSiteName() && (
                  <div className="selected-site-info">
                    <div className="site-info-card">
                      <div className="site-info-name">
                        {getSelectedSiteName()}
                      </div>
                      <div className="site-info-validation">
                        {sites?.find((s) => s.id === selectedSite)
                          ?.require_double_validation
                          ? "Double validation requise"
                          : "Validation simple"}
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
                        isExpanded={expandedPostes.has(poste.id)}
                        onToggleExpansion={() => togglePosteExpansion(poste.id)}
                        siteConfig={siteConfig}
                        onIndicateurToggle={handleIndicateurToggle}
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
      siteConfig.postesConfig[poste.id]?.indicateurs?.includes(indicateurId),
    );
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
                <label key={indicateur.id} className="indicateur-checkbox">
                  <input
                    type="checkbox"
                    checked={isIndicateurSelected(indicateur.id)}
                    onChange={() => onIndicateurToggle(poste.id, indicateur.id)}
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
