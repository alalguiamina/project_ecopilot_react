import React from "react";
import { Users, Shield, CheckCircle, Database } from "lucide-react";
import { useGetUsersBySite } from "../../hooks/useGetUsersBySite";
import type { Site } from "../../types/site";

interface ValidatorInfo {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface SiteCardProps {
  site: Site;
  validators?: ValidatorInfo[];
  onSaisieClick: (siteId: number) => void;
  userRole: string;
}

const SiteCard: React.FC<SiteCardProps> = ({
  site,
  validators: adminValidators,
  onSaisieClick,
  userRole,
}) => {
  // For agents, don't fetch users to avoid permission issues
  // Show simplified view without validator details
  const { data: siteUsers } = useGetUsersBySite(
    userRole === "admin" ? site.id : null,
  );

  // Use admin validators if available, otherwise use site-specific users for agents
  const validators =
    adminValidators ||
    siteUsers?.map((u) => ({
      id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
    })) ||
    [];

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "user":
        return "Utilisateur";
      case "super_user":
        return "Super Utilisateur";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  const getValidatorName = (validator: ValidatorInfo) => {
    if (validator.first_name || validator.last_name) {
      return `${validator.first_name || ""} ${validator.last_name || ""}`.trim();
    }
    return validator.username;
  };

  return (
    <div className="site-card">
      <div className="site-header">
        <div className="site-info">
          <h3 className="site-name">{site.name}</h3>
          {site.location && <p className="site-description">{site.location}</p>}
        </div>
        <div
          className={`site-badge validation-${site.require_double_validation ? "double" : "simple"}`}
        >
          {site.require_double_validation ? (
            <>
              <Shield size={12} />
              Double validation
            </>
          ) : (
            <>
              <CheckCircle size={12} />
              Validation simple
            </>
          )}
        </div>
      </div>

      <div className="validators-section">
        <div className="validators-label">
          <Users size={16} />
          {userRole === "admin" ? "Validateurs assignés" : "Validation requise"}
        </div>

        {userRole === "admin" ? (
          validators.length > 0 ? (
            <div className="validators-list">
              {validators.map((validator) => (
                <div
                  key={validator.id}
                  className={`validator-chip role-${validator.role}`}
                >
                  <span>{getValidatorName(validator)}</span>
                  <span className="role-badge">
                    {getRoleDisplayName(validator.role)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-validators">
              Aucun validateur assigné à ce site
            </div>
          )
        ) : (
          <div className="agent-validator-info">
            <p className="validator-info-text">
              {site.require_double_validation
                ? "Ce site nécessite une double validation"
                : "Ce site utilise une validation simple"}
            </p>
          </div>
        )}
      </div>

      <div className="site-actions">
        <button
          className="btn-saisie"
          onClick={() => onSaisieClick(site.id)}
          disabled={
            userRole === "admin" &&
            validators.length === 0 &&
            site.require_double_validation
          }
        >
          <Database size={16} />
          Saisie
        </button>
      </div>
    </div>
  );
};

export default SiteCard;
