import React, { useState } from "react";
import {
  Check,
  X,
  Eye,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useValidateSaisie } from "../../hooks/useValidateSaisie";
import type { Site } from "../../types/site";
import type { Saisie } from "../../types/saisie";
import SaisieViewDialog from "./SaisieViewDialog";

interface ValidatorInfo {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface SaisieCardProps {
  site: Site;
  saisie: Saisie;
  validators?: ValidatorInfo[];
  userRole: string;
  creatorUser?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    role: string;
  } | null;
}

const SaisieCard: React.FC<SaisieCardProps> = ({
  site,
  saisie,
  validators = [],
  userRole,
  creatorUser,
}) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const validateSaisieMutation = useValidateSaisie({
    onSuccess: (data) => {
      console.log("Saisie validation successful:", data);
      let message = "";
      switch (data.statut) {
        case "valide":
          message = "Saisie validée avec succès !";
          break;
        case "valide_partiellement":
          message = "Saisie partiellement validée avec succès !";
          break;
        case "rejete":
        case "refuse":
          message = "Saisie rejetée avec succès !";
          break;
        default:
          message = `Saisie ${data.statut} avec succès !`;
      }
      alert(message);
    },
    onError: (error) => {
      console.error("Error validating saisie:", error);
      alert(`Erreur lors de la validation: ${error.message}`);
    },
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_attente":
        return <AlertCircle size={16} />;
      case "valide_partiellement":
        return <CheckCircle size={16} />;
      case "valide":
        return <CheckCircle size={16} />;
      case "rejete":
        return <X size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const canValidate = () => {
    // Based on the documentation matrix:
    // ADMIN: can validate any status on any site
    // USER: can validate "en_attente" status
    // SUPERUSER: can validate "en_attente" and "valide_partiellement"
    // AGENT: cannot validate (only create/edit)

    if (userRole === "agent") return false;

    if (userRole === "admin") return true;

    if (userRole === "user") {
      return saisie.statut === "en_attente";
    }

    if (userRole === "superuser") {
      return (
        saisie.statut === "en_attente" ||
        saisie.statut === "valide_partiellement"
      );
    }

    return false;
  };

  const handleValidate = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir valider cette saisie ?`)) {
      validateSaisieMutation.mutate({
        id: saisie.id,
        action: "valider",
      });
    }
  };

  const handleReject = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir rejeter cette saisie ?`)) {
      validateSaisieMutation.mutate({
        id: saisie.id,
        action: "rejeter",
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "user":
        return "Utilisateur";
      case "superuser":
        return "Super Utilisateur";
      case "admin":
        return "Administrateur";
      case "agent":
        return "Agent";
      default:
        return role;
    }
  };

  return (
    <>
      <div className="site-card">
        <div className="site-header">
          <div className="site-info">
            <h3 className="site-name">{site.name}</h3>
            <div className="site-location-container">
              {site.location && site.location !== "Emplacement non spécifié" ? (
                <div className="site-location-badge">
                  <span className="location-icon">📍</span>
                  <span>{site.location}</span>
                </div>
              ) : (
                <div className="site-location-badge no-location">
                  <span className="location-icon">📋</span>
                  <span>Emplacement à définir</span>
                </div>
              )}
            </div>
          </div>
          <div className="site-status">
            <div
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(saisie.statut),
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {getStatusIcon(saisie.statut)}
              {getStatusDisplayName(saisie.statut)}
            </div>
          </div>
        </div>

        <div className="site-details">
          <div className="detail-row">
            <div className="site-detail-item primary">
              <Calendar size={18} />
              <div className="detail-content">
                <span className="detail-label">Période</span>
                <span className="detail-value">
                  {getMonthName(saisie.mois)} {saisie.annee}
                </span>
              </div>
            </div>

            <div className="site-detail-item primary">
              <User size={18} />
              <div className="detail-content">
                <span className="detail-label">Créé par</span>
                <span className="detail-value">
                  {creatorUser
                    ? (() => {
                        const firstName = creatorUser.first_name?.trim();
                        const lastName = creatorUser.last_name?.trim();

                        if (firstName && lastName) {
                          return `${firstName} ${lastName}`;
                        } else if (firstName) {
                          return firstName;
                        } else if (lastName) {
                          return lastName;
                        } else {
                          // Fallback to username if no name parts available
                          return creatorUser.username;
                        }
                      })()
                    : `Utilisateur #${saisie.created_by}`}
                </span>
              </div>
            </div>
          </div>

          {saisie.require_double_validation && (
            <div className="validation-requirement">
              <CheckCircle size={16} />
              <span>Double validation requise</span>
            </div>
          )}

          <div className="detail-dates">
            <div className="date-item">
              <span className="date-label">📅 Création</span>
              <span className="date-value">
                {new Date(saisie.date_creation).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {saisie.first_validation_date && (
              <div className="date-item">
                <span className="date-label">✓ Première validation</span>
                <span className="date-value">
                  {new Date(saisie.first_validation_date).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            )}

            {saisie.final_validation_date && (
              <div className="date-item">
                <span className="date-label">✓✓ Validation finale</span>
                <span className="date-value">
                  {new Date(saisie.final_validation_date).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {validators.length > 0 && (
          <div className="validators-section">
            <h4 className="validators-title">👥 Validateurs assignés</h4>
            <div className="validators-list">
              {validators.slice(0, 3).map((validator) => (
                <div key={validator.id} className="validator-item">
                  <span className="validator-name">
                    {(() => {
                      const firstName = validator.first_name?.trim();
                      const lastName = validator.last_name?.trim();

                      if (firstName && lastName) {
                        return `${firstName} ${lastName}`;
                      } else if (firstName) {
                        return firstName;
                      } else if (lastName) {
                        return lastName;
                      } else {
                        return validator.username;
                      }
                    })()}
                  </span>
                  <span
                    className={`role-badge ${validator.role.toLowerCase().replace("_", "-")}`}
                  >
                    {getRoleDisplayName(validator.role)}
                  </span>
                </div>
              ))}
              {validators.length > 3 && (
                <div className="validator-item">
                  <span className="validator-more">
                    +{validators.length - 3} autre(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="site-actions">
          <button
            className="btn btn-view"
            onClick={() => setIsViewDialogOpen(true)}
          >
            <Eye size={16} />
            Consulter
          </button>

          {canValidate() && (
            <>
              <button
                className="btn btn-validate"
                onClick={handleValidate}
                disabled={validateSaisieMutation.isPending}
              >
                <Check size={16} />
                {validateSaisieMutation.isPending ? "Validation..." : "Valider"}
              </button>

              <button
                className="btn btn-reject"
                onClick={handleReject}
                disabled={validateSaisieMutation.isPending}
              >
                <X size={16} />
                {validateSaisieMutation.isPending ? "Rejet..." : "Rejeter"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <SaisieViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        site={site}
        saisie={saisie}
      />
    </>
  );
};

export default SaisieCard;
