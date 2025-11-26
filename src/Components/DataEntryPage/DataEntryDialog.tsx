import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Save, FileText, Ban } from "lucide-react";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useGetTypeIndicateurs } from "../../hooks/useGetTypeIndicators";
import { useCreateSaisie } from "../../hooks/useCreateSaisie";
import { useGetSaisies } from "../../hooks/useGetSaisies";
import { useUpdateSaisie } from "../../hooks/useUpdateSaisie";
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
  indicators: TypeIndicateur[];
}

export const DataEntryDialog: React.FC<DataEntryDialogProps> = ({
  isOpen,
  onClose,
  site,
  userRole,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [indicatorData, setIndicatorData] = useState<IndicatorData>({});
  const [existingSaisie, setExistingSaisie] = useState<Saisie | null>(null);
  const [isManualDateChange, setIsManualDateChange] = useState(false);

  // Fetch data
  const { data: postesEmission } = useGetPostesEmission();
  const { data: typeIndicateurs } = useGetTypeIndicateurs();

  // Fetch existing saisies for this site/month/year
  const { data: existingSaisies } = useGetSaisies({
    siteId: site?.id,
    mois: selectedMonth,
    annee: selectedYear,
    enabled: Boolean(site?.id && selectedMonth && selectedYear),
  });

  // Create saisie mutation
  const createSaisieMutation = useCreateSaisie({
    onSuccess: (data) => {
      console.log("Saisie created successfully:", data);
      alert("Saisie créée avec succès !");
      onClose();
    },
    onError: (error) => {
      console.error("Error creating saisie:", error);
      alert(`Erreur lors de la création: ${error.message}`);
    },
  });

  // Update saisie mutation
  const updateSaisieMutation = useUpdateSaisie({
    onSuccess: (data) => {
      console.log("Saisie updated successfully:", data);
      // Show success message but keep dialog open to show the updated data
      alert("Saisie mise à jour avec succès !");
      // onClose();
    },
    onError: (error) => {
      console.error("Error updating saisie:", error);
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Organize indicators by poste
  const posteWithIndicators = useMemo((): PosteWithIndicators[] => {
    if (!postesEmission || !typeIndicateurs || !site.config_json) return [];

    // Parse the site configuration
    const siteConfig = site.config_json;
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

        const indicators = config.indicateurs
          .map((indicatorId: number) => indicatorsMap.get(indicatorId))
          .filter(
            (
              indicator: TypeIndicateur | undefined,
            ): indicator is TypeIndicateur => Boolean(indicator),
          );

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
  }, [postesEmission, typeIndicateurs, site.config_json]);

  // Check for existing saisie and load data
  useEffect(() => {
    console.log("[DataEntryDialog] Existing saisies data:", existingSaisies);

    if (existingSaisies && existingSaisies.length > 0) {
      const saisie = existingSaisies[0]; // Should only be one per site/month/year
      console.log("[DataEntryDialog] Loading existing saisie:", saisie);

      setExistingSaisie(saisie);

      // Update month/year to match the loaded saisie (but don't trigger manual change)
      setSelectedMonth(saisie.mois);
      setSelectedYear(saisie.annee);

      // Load existing values into the form
      const newIndicatorData: IndicatorData = {};
      saisie.valeurs.forEach((valeur) => {
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
      console.log("[DataEntryDialog] No existing saisies found");
      setExistingSaisie(null);
    }
  }, [existingSaisies]);

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

      // Only set to current date if this is a fresh dialog open and no existing data
      // Wait a bit to see if existing saisies will be loaded
      const timeout = setTimeout(() => {
        if (!existingSaisies || existingSaisies.length === 0) {
          console.log(
            "[DataEntryDialog] No existing saisies, setting to current date",
          );
          setSelectedMonth(currentDate.getMonth() + 1);
          setSelectedYear(currentDate.getFullYear());
        }
      }, 100); // Small delay to allow data to load

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Separate effect to handle dialog closure cleanup
  useEffect(() => {
    if (!isOpen) {
      // Only clear when dialog is closed
      console.log("[DataEntryDialog] Dialog closed, clearing state");
      setIndicatorData({});
      setExistingSaisie(null);
      setIsManualDateChange(false);
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
    // All configured indicators are considered required for now
    return posteWithIndicators.some((item) =>
      item.indicators.some(
        (indicator) => !indicatorData[indicator.id]?.value?.trim(),
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
                            <span className="required-badge">*</span>
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
            Annuler
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
