import React, { useMemo } from "react";
import { X, Calendar, FileText, Eye } from "lucide-react";
import { useGetPostesEmission } from "../../hooks/useGetPostesEmission";
import { useGetTypeIndicateurs } from "../../hooks/useGetTypeIndicators";
import type { Site } from "../../types/site";
import type { TypeIndicateur } from "../../types/typeIndicateurs";
import type { Saisie } from "../../types/saisie";
import "./DataEntryDialog.css";

interface SaisieViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  saisie: Saisie;
}

interface PosteWithIndicators {
  poste: {
    id: number;
    name: string;
  };
  indicators: Array<{
    id: number;
    code: string;
    libelle: string;
    unite_default: string;
    value?: string;
    obligatoire?: boolean;
  }>;
}

export const SaisieViewDialog: React.FC<SaisieViewDialogProps> = ({
  isOpen,
  onClose,
  site,
  saisie,
}) => {
  // Fetch data
  const { data: postesEmission } = useGetPostesEmission();
  const { data: typeIndicateurs } = useGetTypeIndicateurs();

  // Organize indicators by poste with values
  const posteWithIndicators = useMemo((): PosteWithIndicators[] => {
    if (!postesEmission || !typeIndicateurs) return [];

    // Use site config_json which contains obligatoire information
    const siteConfig = site.config_json;
    if (!Array.isArray(siteConfig)) return [];

    // Create a map of indicators by ID for quick lookup
    const indicatorsMap = new Map<number, TypeIndicateur>(
      (typeIndicateurs || []).map((indicator: TypeIndicateur) => [
        indicator.id,
        indicator,
      ]),
    );

    // Create a map of values by type_indicateur
    const valuesMap = new Map(
      saisie.valeurs.map((valeur) => [
        valeur.type_indicateur,
        valeur.valeur.toString(),
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
                : indicatorItem.id || indicatorItem.indicateur_id; // Handle both id and indicateur_id
            const obligatoire =
              typeof indicatorItem === "object"
                ? indicatorItem.obligatoire
                : false;

            const indicator = indicatorsMap.get(indicatorId);
            if (!indicator) return null;

            return {
              id: indicator.id,
              code: indicator.code,
              libelle: indicator.libelle,
              unite_default: indicator.unite_default,
              value: valuesMap.get(indicatorId) || "",
              obligatoire,
            };
          })
          .filter(
            (indicator: any): indicator is NonNullable<typeof indicator> =>
              Boolean(indicator),
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
  }, [postesEmission, typeIndicateurs, site.config_json, saisie.valeurs]);

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

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "valide_partiellement":
        return "Validé partiellement";
      case "valide":
        return "Validé";
      case "rejete":
        return "Rejeté";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente":
        return "#f59e0b"; // amber
      case "valide_partiellement":
        return "#3b82f6"; // blue
      case "valide":
        return "#10b981"; // green
      case "rejete":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <div className="dialog-title-section">
            <h2 className="dialog-title">
              <Eye size={20} />
              Consultation de Saisie
            </h2>
            <p className="dialog-subtitle">
              Site: {site.name} • {getMonthName(saisie.mois)} {saisie.annee}
            </p>
            <div className="status-info" style={{ marginTop: "8px" }}>
              <span
                className="status-badge"
                style={{
                  backgroundColor: getStatusColor(saisie.statut),
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {getStatusDisplayName(saisie.statut)}
              </span>
              {saisie.require_double_validation && (
                <span
                  className="double-validation-badge"
                  style={{
                    marginLeft: "8px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Double validation requise
                </span>
              )}
            </div>
          </div>
          <button className="dialog-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-content">
          {/* Date Display */}
          <div className="date-selection">
            <div className="date-field">
              <label>
                <Calendar size={16} />
                Période
              </label>
              <div className="readonly-field">
                {getMonthName(saisie.mois)} {saisie.annee}
              </div>
            </div>
            <div className="date-field">
              <label>Date de création</label>
              <div className="readonly-field">
                {new Date(saisie.date_creation).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>

          {/* Indicators by Poste - Read Only */}
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
                            {indicator.obligatoire && (
                              <span className="required-badge">*</span>
                            )}
                          </div>
                        </div>
                        <div className="indicator-input-container">
                          <div className="readonly-value">
                            {indicator.value || "—"}
                          </div>
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
          <button className="btn-cancel" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaisieViewDialog;
