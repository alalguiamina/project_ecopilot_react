import React from "react";
import { Calendar, User, Edit, Eye, Check, X } from "lucide-react";
import type { Site } from "../../types/site";
import type { Saisie } from "../../types/saisie";

interface SaisieItemProps {
  site: Site;
  saisie: Saisie;
  onEdit: (siteId: number) => void;
  creatorUser?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

const SaisieItem: React.FC<SaisieItemProps> = ({
  site,
  saisie,
  onEdit,
  creatorUser,
}) => {
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
      case "refuse":
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
      case "refuse":
      case "rejete":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_attente":
        return "⏳";
      case "valide_partiellement":
        return "🔄";
      case "valide":
        return "✅";
      case "refuse":
      case "rejete":
        return "❌";
      default:
        return "❓";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="saisie-item">
      <div className="saisie-item-header">
        <div className="saisie-item-title">
          <Calendar size={16} />
          <span className="period">
            {getMonthName(saisie.mois)} {saisie.annee}
          </span>
        </div>
        <div className="saisie-item-status">
          <span
            className="status-badge"
            style={{
              backgroundColor: getStatusColor(saisie.statut),
              color: "white",
            }}
          >
            {getStatusIcon(saisie.statut)} {getStatusDisplayName(saisie.statut)}
          </span>
        </div>
      </div>

      <div className="saisie-item-content">
        <div className="saisie-item-info">
          <div className="info-row">
            <User size={14} />
            <span className="info-label">Créé par:</span>
            <span className="info-value">
              {creatorUser
                ? creatorUser.first_name && creatorUser.last_name
                  ? `${creatorUser.first_name} ${creatorUser.last_name}`
                  : creatorUser.username
                : `Utilisateur #${saisie.created_by}`}
            </span>
          </div>

          <div className="info-row">
            <Calendar size={14} />
            <span className="info-label">Créé le:</span>
            <span className="info-value">
              {formatDate(saisie.date_creation)}
            </span>
          </div>

          {saisie.valeurs && (
            <div className="info-row">
              <Edit size={14} />
              <span className="info-label">Indicateurs:</span>
              <span className="info-value">
                {saisie.valeurs.length} saisi(s)
              </span>
            </div>
          )}

          {saisie.require_double_validation && (
            <div className="info-row validation-info">
              <Check size={14} />
              <span className="validation-badge">
                Double validation requise
              </span>
            </div>
          )}
        </div>

        {(saisie.first_validation_date || saisie.final_validation_date) && (
          <div className="validation-dates">
            {saisie.first_validation_date && (
              <div className="validation-date">
                <span className="validation-label">1ère validation:</span>
                <span>{formatDate(saisie.first_validation_date)}</span>
              </div>
            )}
            {saisie.final_validation_date && (
              <div className="validation-date">
                <span className="validation-label">Validation finale:</span>
                <span>{formatDate(saisie.final_validation_date)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="saisie-item-actions">
        <button
          className="btn btn-primary"
          onClick={() => onEdit(site.id)}
          title="Modifier cette saisie"
        >
          <Edit size={16} />
          Modifier
        </button>
      </div>
    </div>
  );
};

export default SaisieItem;
