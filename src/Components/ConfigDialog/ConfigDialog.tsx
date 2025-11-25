import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  ChevronUp,
} from "lucide-react";
import { useGetSites } from "../../hooks/useGetSites";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useUpdateSiteConfig } from "../../hooks/useUpdateSiteConfig";
import type { Site } from "../../types/site";
import type { PosteEmission } from "../../types/postesEmission";
import type { TypeIndicateur } from "../../types/typeIndicateurs";
import "./ConfigDialog.css";
import { useGetTypeIndicateurs } from "hooks/useGetTypeIndicators";

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

  const { data: sites, isLoading: sitesLoading } = useGetSites();
  const { data: postes, isLoading: postesLoading } = useGetPostesEmission();
  const { data: typeIndicateurs, isLoading: indicateursLoading } =
    useGetTypeIndicateurs();
  const updateSiteConfigMutation = useUpdateSiteConfig();

  useEffect(() => {
    if (selectedSite && postes) {
      // Initialize config for selected site
      const initialConfig: SiteConfig = {
        siteId: selectedSite,
        postesConfig: {},
      };

      postes.forEach((poste) => {
        initialConfig.postesConfig[poste.id] = {
          indicateurs: [],
        };
      });

      setSiteConfig(initialConfig);
    }
  }, [selectedSite, postes]);

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
    setSiteConfig((prev) => {
      const newConfig = { ...prev };
      const posteConfig = newConfig.postesConfig[posteId];
      const indicateurs = [...posteConfig.indicateurs];

      const index = indicateurs.indexOf(indicateurId);
      if (index > -1) {
        indicateurs.splice(index, 1);
      } else {
        indicateurs.push(indicateurId);
      }

      newConfig.postesConfig[posteId] = {
        ...posteConfig,
        indicateurs,
      };

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
              obligatoire: true, // You can make this configurable if needed
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

  const isIndicateurSelected = (posteId: number, indicateurId: number) => {
    return (
      siteConfig.postesConfig[posteId]?.indicateurs.includes(indicateurId) ||
      false
    );
  };

  const getSelectedSiteName = () => {
    if (!selectedSite || !sites) return null;
    const site = sites.find((s) => s.id === selectedSite);
    return site ? site.name : null;
  };

  if (!isOpen) return null;

  const isLoading = sitesLoading || postesLoading || indicateursLoading;

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
                  <select
                    className="site-select"
                    value={selectedSite || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        handleSiteSelect(parseInt(value));
                      } else {
                        setSelectedSite(null);
                      }
                    }}
                  >
                    <option value="">Choisir un site...</option>
                    {sites?.map((site: Site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" size={20} />
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
                      <div key={poste.id} className="poste-panel">
                        <button
                          className="poste-header"
                          onClick={() => togglePosteExpansion(poste.id)}
                        >
                          <div className="poste-info">
                            <span className="poste-icon">
                              {expandedPostes.has(poste.id) ? (
                                <ChevronDown size={20} />
                              ) : (
                                <ChevronRight size={20} />
                              )}
                            </span>
                            <span className="poste-name">{poste.name}</span>
                          </div>
                          <div className="selected-count">
                            {siteConfig.postesConfig[poste.id]?.indicateurs
                              .length || 0}{" "}
                            indicateur(s)
                          </div>
                        </button>

                        {expandedPostes.has(poste.id) && (
                          <div className="poste-content">
                            <div className="indicateurs-grid">
                              {typeIndicateurs?.map(
                                (indicateur: TypeIndicateur) => (
                                  <label
                                    key={indicateur.id}
                                    className="indicateur-checkbox"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isIndicateurSelected(
                                        poste.id,
                                        indicateur.id,
                                      )}
                                      onChange={() =>
                                        handleIndicateurToggle(
                                          poste.id,
                                          indicateur.id,
                                        )
                                      }
                                    />
                                    <div className="checkbox-content">
                                      <span className="indicateur-name">
                                        {indicateur.name}
                                      </span>
                                      <span className="indicateur-description">
                                        {indicateur.description}
                                      </span>
                                    </div>
                                  </label>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
