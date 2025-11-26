import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Save, FileText, Ban } from "lucide-react";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useGetTypeIndicateurs } from "../../hooks/useGetTypeIndicators";
import type { Site } from "../../types/site";
import type { TypeIndicateur } from "../../types/typeIndicateurs";
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
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data
  const { data: postesEmission } = useGetPostesEmission();
  const { data: typeIndicateurs } = useGetTypeIndicateurs();

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

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      const currentDate = new Date();
      setSelectedMonth(currentDate.getMonth() + 1);
      setSelectedYear(currentDate.getFullYear());
      setIndicatorData({});
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
    setIsSaving(true);
    try {
      // TODO: Implement API call to save data
      console.log("Saving data:", {
        siteId: site.id,
        month: selectedMonth,
        year: selectedYear,
        data: indicatorData,
        isDraft,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!isDraft) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSaving(false);
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
            <h2 className="dialog-title">Saisie de Données</h2>
            <p className="dialog-subtitle">
              Site: {site.name} •{" "}
              {userRole === "agent" ? "Mode Agent" : "Mode Admin"}
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
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
                onChange={(e) => setSelectedYear(Number(e.target.value))}
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
            {posteWithIndicators.length === 0 ? (
              <div className="empty-indicators">
                <p>Aucun indicateur configuré pour ce site</p>
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
                            disabled={isSaving}
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
            disabled={isSaving}
          >
            <Ban size={16} />
            Annuler
          </button>
          <button
            className="btn-draft"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <FileText size={16} />
            Brouillon
          </button>
          <button
            className="btn-save"
            onClick={() => handleSave(false)}
            disabled={isSaving || hasRequiredFields()}
          >
            <Save size={16} />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryDialog;
