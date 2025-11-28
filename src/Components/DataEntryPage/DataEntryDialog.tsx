import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Save, FileText, Ban } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useGetTypeIndicateurs } from "../../hooks/useGetTypeIndicators";
import { useCreateSaisie } from "../../hooks/useCreateSaisie";
import { useGetSaisies } from "../../hooks/useGetSaisies";
import { useUpdateSaisie } from "../../hooks/useUpdateSaisie";
import { useGetDetailedSiteConfig } from "../../hooks/useGetDetailedSiteConfig";
import type { Site } from "../../types/site";
import type { TypeIndicateur } from "../../types/typeIndicateurs";
import type {
  CreateSaisieRequest,
  UpdateSaisieRequest,
  SaisieValeur,
  Saisie,
} from "../../types/saisie";
import "./DataEntryDialog.css";

interface DataEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  userRole: string;
}

interface IndicatorData {
  [indicatorId: number]: {
    value: string;
    isDraft: boolean;
  };
}

interface PosteWithIndicators {
  poste: {
    id: number;
    name: string;
  };
  indicators: Array<TypeIndicateur & { obligatoire?: boolean }>;
}

export const DataEntryDialog: React.FC<DataEntryDialogProps> = ({
  isOpen,
  onClose,
  site,
  userRole,
}) => {
  console.log("[DataEntryDialog] Dialog rendered with props:", {
    isOpen,
    siteId: site?.id,
    userRole,
    timestamp: new Date().toISOString(),
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [indicatorData, setIndicatorData] = useState<IndicatorData>({});
  const [existingSaisie, setExistingSaisie] = useState<Saisie | null>(null);
  const [isManualDateChange, setIsManualDateChange] = useState(false);

  // Track dialog open/close state changes
  useEffect(() => {
    console.log("[DataEntryDialog] Dialog state changed:", {
      isOpen,
      siteId: site?.id,
      timestamp: new Date().toISOString(),
    });

    if (!isOpen) {
      console.log("[DataEntryDialog] Dialog closed - clearing form data");
      // Clear form data when dialog closes to prevent stale data on reopen
      setIndicatorData({});
      setExistingSaisie(null);
      setIsManualDateChange(false);
      // Reset to current month/year when closing
      setSelectedMonth(new Date().getMonth() + 1);
      setSelectedYear(new Date().getFullYear());
    }
  }, [isOpen]);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch data
  const { data: postesEmission } = useGetPostesEmission();
  const { data: typeIndicateurs } = useGetTypeIndicateurs();
  const { data: detailedSiteConfig } = useGetDetailedSiteConfig(
    site?.id || null,
  );

  // Fetch existing saisies for this site/month/year
  const {
    data: existingSaisies,
    refetch: refetchSaisies,
    isLoading: saisiesLoading,
  } = useGetSaisies({
    siteId: site?.id,
    mois: selectedMonth,
    annee: selectedYear,
    enabled: Boolean(site?.id && selectedMonth && selectedYear),
  });

  // Create saisie mutation
  const createSaisieMutation = useCreateSaisie({
    onSuccess: async (data) => {
      console.log("Saisie created successfully:", data);
      alert("Saisie créée avec succès !");

      // Invalidate all saisies queries to force fresh data fetch
      console.log("Invalidating saisies cache after create...");
      await queryClient.invalidateQueries({ queryKey: ["saisies"] });

      // Manually refetch the saisies to get the updated data
      console.log("Refetching saisies after create...");
      const refetchResult = await refetchSaisies();
      console.log("Refetch result after create:", {
        data: refetchResult.data?.map((s) => ({
          id: s.id,
          site: s.site,
          mois: s.mois,
          annee: s.annee,
        })),
        error: refetchResult.error,
        isSuccess: refetchResult.isSuccess,
      });
    },
    onError: (error) => {
      console.error("Error creating saisie:", error);
      alert(`Erreur lors de la création: ${error.message}`);
    },
  });

  // Update saisie mutation
  const updateSaisieMutation = useUpdateSaisie({
    onSuccess: async (data) => {
      console.log("Saisie updated successfully:", data);
      alert("Saisie mise à jour avec succès !");

      // Invalidate all saisies queries to force fresh data fetch
      console.log("Invalidating saisies cache after update...");
      await queryClient.invalidateQueries({ queryKey: ["saisies"] });

      // Manually refetch the saisies to get the updated data
      console.log("Refetching saisies after update...");
      const refetchResult = await refetchSaisies();
      console.log("Refetch result after update:", {
        data: refetchResult.data?.map((s) => ({
          id: s.id,
          site: s.site,
          mois: s.mois,
          annee: s.annee,
          valeurs: s.valeurs?.length,
        })),
        error: refetchResult.error,
        isSuccess: refetchResult.isSuccess,
      });
    },
    onError: (error) => {
      console.error("Error updating saisie:", error);
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Organize indicators by poste
  const posteWithIndicators = useMemo((): PosteWithIndicators[] => {
    if (!postesEmission || !typeIndicateurs) return [];

    // Use detailed config if available, fall back to basic config
    const siteConfig =
      detailedSiteConfig?.organized_configs || site.config_json;
    if (!Array.isArray(siteConfig)) return [];

    // Create a map of indicators by ID for quick lookup
    const indicatorsMap = new Map<number, TypeIndicateur>(
      (typeIndicateurs || []).map((indicator: TypeIndicateur) => [
        indicator.id,
        indicator,
      ]),
    );

    // Create a map of postes by ID for quick lookup
    const postesMap = new Map(postesEmission.map((poste) => [poste.id, poste]));

    // Build the structure from site config
    return siteConfig
      .map((config) => {
        const poste = postesMap.get(config.poste);
        if (!poste) return null;

        // Handle both detailed config (with obligatoire) and basic config
        const configIndicateurs = Array.isArray(config.indicateurs)
          ? config.indicateurs
          : [];

        const indicators = configIndicateurs
          .map((indicatorItem: any) => {
            // Handle both formats: number (basic) or object (detailed)
            const indicatorId =
              typeof indicatorItem === "number"
                ? indicatorItem
                : indicatorItem.id;
            const obligatoire =
              typeof indicatorItem === "object"
                ? indicatorItem.obligatoire
                : false;

            const indicator = indicatorsMap.get(indicatorId);
            if (!indicator) return null;

            return {
              ...indicator,
              obligatoire,
            };
          })
          .filter(Boolean);

        return {
          poste: {
            id: poste.id,
            name: poste.name,
          },
          indicators: indicators,
        };
      })
      .filter((item): item is PosteWithIndicators => Boolean(item))
      .filter((item) => item.indicators.length > 0);
  }, [postesEmission, typeIndicateurs, site.config_json, detailedSiteConfig]);

  // Check for existing saisie and load data
  useEffect(() => {
    console.log("[DataEntryDialog] Existing saisies effect:", {
      existingSaisies: existingSaisies?.length,
      existingSaisiesData: existingSaisies?.map((s) => ({
        id: s.id,
        site: s.site,
        mois: s.mois,
        annee: s.annee,
        valeurs: s.valeurs?.length,
      })),
      site: site?.id,
      month: selectedMonth,
      year: selectedYear,
      isOpen,
      saisiesLoading,
      timestamp: new Date().toISOString(),
    });

    // Clear data first to prevent stale data
    setIndicatorData({});
    setExistingSaisie(null);

    if (
      !isOpen ||
      !site?.id ||
      !selectedMonth ||
      !selectedYear ||
      saisiesLoading
    ) {
      console.log("[DataEntryDialog] Effect skipped due to conditions:", {
        isOpen,
        siteId: site?.id,
        month: selectedMonth,
        year: selectedYear,
        loading: saisiesLoading,
      });
      return;
    }

    if (existingSaisies && existingSaisies.length > 0) {
      // Find the saisie that matches current site/month/year exactly
      const matchingSaisie = existingSaisies.find(
        (saisie) =>
          saisie.site === site.id &&
          saisie.mois === selectedMonth &&
          saisie.annee === selectedYear,
      );

      if (matchingSaisie) {
        console.log("[DataEntryDialog] Found matching existing saisie:", {
          id: matchingSaisie.id,
          site: matchingSaisie.site,
          mois: matchingSaisie.mois,
          annee: matchingSaisie.annee,
          valeursCount: matchingSaisie.valeurs?.length,
          valeurs: matchingSaisie.valeurs,
        });
        setExistingSaisie(matchingSaisie);

        // Load existing values into the form
        const newIndicatorData: IndicatorData = {};
        matchingSaisie.valeurs.forEach((valeur) => {
          newIndicatorData[valeur.type_indicateur] = {
            value: valeur.valeur.toString(),
            isDraft: false,
          };
        });

        console.log(
          "[DataEntryDialog] Loading indicator data:",
          newIndicatorData,
        );
        setIndicatorData(newIndicatorData);
      } else {
        console.log(
          "[DataEntryDialog] No matching saisie found, preparing for new entry",
        );
        setExistingSaisie(null);
        setIndicatorData({});
      }
    } else {
      console.log("[DataEntryDialog] No existing saisies found");
      setExistingSaisie(null);
      setIndicatorData({});
    }
  }, [
    existingSaisies,
    site?.id,
    selectedMonth,
    selectedYear,
    isOpen,
    saisiesLoading,
  ]);

  // Handle manual date changes (when user changes month/year selectors)
  // This will trigger a refetch of saisies for the new date
  useEffect(() => {
    if (isOpen && site?.id && isManualDateChange) {
      // When date changes manually, clear the current data to prepare for new data
      // The existing saisie detection will reload data if there's a match
      console.log(
        "[DataEntryDialog] Manual date change detected, clearing form",
      );
      setExistingSaisie(null);
      setIndicatorData({});
      setIsManualDateChange(false); // Reset the flag
    }
  }, [selectedMonth, selectedYear, site?.id, isOpen, isManualDateChange]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log(
        "[DataEntryDialog] Dialog opened, checking for existing data",
      );
      const currentDate = new Date();

      // Set to current date initially (will be overridden if existing saisie is found)
      if (!selectedMonth || !selectedYear) {
        setSelectedMonth(currentDate.getMonth() + 1);
        setSelectedYear(currentDate.getFullYear());
      }
    }
  }, [isOpen]);

  // Reset form when site changes (but not when dialog first opens)
  useEffect(() => {
    if (isOpen && site?.id) {
      console.log("[DataEntryDialog] Site effect triggered for site:", site.id);
      // Only reset if we're actually changing sites, not on initial load
      // This is handled by the dialog opening/closing cycle
    }
  }, [site?.id, isOpen]); // Separate effect to handle dialog closure cleanup
  useEffect(() => {
    if (!isOpen) {
      // Clear everything when dialog is closed
      console.log("[DataEntryDialog] Dialog closed, clearing all state");
      setIndicatorData({});
      setExistingSaisie(null);
      setIsManualDateChange(false);

      // Reset to current date for next time
      const currentDate = new Date();
      setSelectedMonth(currentDate.getMonth() + 1);
      setSelectedYear(currentDate.getFullYear());
    }
  }, [isOpen]);
  const handleInputChange = (indicatorId: number, value: string) => {
    setIndicatorData((prev) => ({
      ...prev,
      [indicatorId]: {
        value,
        isDraft: false,
      },
    }));
  };

  const handleSave = async (isDraft = false) => {
    if (!site?.id || !selectedMonth || !selectedYear) {
      alert("Informations manquantes pour la sauvegarde");
      return;
    }

    // Prepare the valeurs array
    const valeurs: SaisieValeur[] = [];

    // Iterate through all configured indicators and collect their values
    posteWithIndicators.forEach(({ indicators }) => {
      indicators.forEach((indicator) => {
        const inputData = indicatorData[indicator.id];
        if (inputData && inputData.value?.trim()) {
          const numericValue = parseFloat(inputData.value);
          if (!isNaN(numericValue)) {
            valeurs.push({
              type_indicateur: indicator.id,
              valeur: numericValue,
              unite: indicator.unite_default,
            });
          }
        }
      });
    });

    if (valeurs.length === 0) {
      alert("Aucune valeur saisie à enregistrer");
      return;
    }

    // TODO: Handle draft functionality if needed
    // For now, we only implement save (not draft)
    if (isDraft) {
      console.log("Draft functionality not yet implemented");
      return;
    }

    try {
      console.log("[DataEntryDialog] About to save:", {
        existingSaisie: existingSaisie?.id,
        site: site.id,
        month: selectedMonth,
        year: selectedYear,
        valueCount: valeurs.length,
      });

      if (existingSaisie) {
        // Update existing saisie
        const updateData: UpdateSaisieRequest = {
          mois: selectedMonth,
          annee: selectedYear,
          valeurs: valeurs,
        };
        console.log("Updating existing saisie:", existingSaisie.id, updateData);
        await updateSaisieMutation.mutateAsync({
          id: existingSaisie.id,
          data: updateData,
        });
      } else {
        // Create new saisie
        const createData: CreateSaisieRequest = {
          site: site.id,
          mois: selectedMonth,
          annee: selectedYear,
          valeurs: valeurs,
        };
        console.log("Creating new saisie:", createData);
        await createSaisieMutation.mutateAsync(createData);
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Save failed:", error);
    }
  };

  const handleCancel = () => {
    setIndicatorData({});
    onClose();
  };

  const getMonthName = (month: number) => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months[month - 1];
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const hasRequiredFields = () => {
    // Only check indicators that are marked as obligatory
    return posteWithIndicators.some((item) =>
      item.indicators.some(
        (indicator) =>
          indicator.obligatoire && !indicatorData[indicator.id]?.value?.trim(),
      ),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <div className="dialog-title-section">
            <h2 className="dialog-title">
              {existingSaisie ? "Modifier la Saisie" : "Nouvelle Saisie"}
            </h2>
            <p className="dialog-subtitle">
              Site: {site.name} •{" "}
              {userRole === "agent" ? "Mode Agent" : "Mode Admin"}
              {existingSaisie && (
                <span className="saisie-status">
                  {" "}
                  • Statut: {existingSaisie.statut}
                </span>
              )}
            </p>
          </div>
          <button className="dialog-close" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-content">
          {/* Date Selection */}
          <div className="date-selection">
            <div className="date-field">
              <label htmlFor="month-select">
                <Calendar size={16} />
                Mois
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => {
                  setIsManualDateChange(true);
                  setSelectedMonth(Number(e.target.value));
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="date-field">
              <label htmlFor="year-select">Année</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => {
                  setIsManualDateChange(true);
                  setSelectedYear(Number(e.target.value));
                }}
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicators by Poste */}
          <div className="indicators-section">
            {!site.config_json ? (
              <div className="empty-indicators">
                <p>Site non configuré</p>
                <p>
                  Ce site n'a pas encore été configuré avec des indicateurs.
                </p>
                <p>
                  Contactez l'administrateur pour configurer les indicateurs de
                  ce site.
                </p>
              </div>
            ) : !Array.isArray(site.config_json) ||
              site.config_json.length === 0 ? (
              <div className="empty-indicators">
                <p>Configuration vide</p>
                <p>
                  Le site a été configuré mais aucun indicateur n'a été assigné.
                </p>
                <p>Contactez l'administrateur pour ajouter des indicateurs.</p>
              </div>
            ) : posteWithIndicators.length === 0 ? (
              <div className="empty-indicators">
                <p>Indicateurs non trouvés</p>
                <p>
                  La configuration existe mais les indicateurs référencés ne
                  sont pas disponibles.
                </p>
                <p>Vérifiez la configuration du site avec l'administrateur.</p>
              </div>
            ) : (
              posteWithIndicators.map(({ poste, indicators }) => (
                <div key={poste.id} className="poste-section">
                  <div className="poste-header">
                    <h3 className="poste-title">{poste.name}</h3>
                  </div>
                  <div className="indicators-list">
                    {indicators.map((indicator) => (
                      <div key={indicator.id} className="indicator-row">
                        <div className="indicator-info">
                          <div className="indicator-label">
                            <span className="indicator-code">
                              {indicator.code}
                            </span>
                            <span className="indicator-name">
                              {indicator.libelle}
                            </span>
                            {indicator.obligatoire && (
                              <span className="required-badge">*</span>
                            )}
                          </div>
                        </div>
                        <div className="indicator-input-container">
                          <input
                            type="number"
                            step="any"
                            placeholder="Saisir la valeur"
                            value={indicatorData[indicator.id]?.value || ""}
                            onChange={(e) =>
                              handleInputChange(indicator.id, e.target.value)
                            }
                            className="indicator-input"
                            disabled={
                              createSaisieMutation.isPending ||
                              updateSaisieMutation.isPending
                            }
                          />
                          <span className="indicator-unit">
                            {indicator.unite_default}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="dialog-actions">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={
              createSaisieMutation.isPending || updateSaisieMutation.isPending
            }
          >
            <Ban size={16} />
            {existingSaisie ? "Fermer" : "Annuler"}
          </button>
          <button
            className="btn-draft"
            onClick={() => handleSave(true)}
            disabled={
              createSaisieMutation.isPending ||
              updateSaisieMutation.isPending ||
              !site.config_json
            }
          >
            <FileText size={16} />
            Brouillon
          </button>
          <button
            className="btn-save"
            onClick={() => handleSave(false)}
            disabled={
              createSaisieMutation.isPending ||
              updateSaisieMutation.isPending ||
              hasRequiredFields() ||
              !site.config_json
            }
          >
            <Save size={16} />
            {createSaisieMutation.isPending || updateSaisieMutation.isPending
              ? "Sauvegarde..."
              : existingSaisie
                ? "Mettre à jour"
                : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryDialog;
