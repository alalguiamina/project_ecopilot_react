import { X } from "lucide-react";
import { SiteComboBox } from "./SiteComboBox";
import { UserData, Site } from "types/organisation";

interface EditUserDialogProps {
  isOpen: boolean;
  user: UserData | null;
  setUser: (u: UserData) => void;
  sites: Site[];
  onSave: () => void;
  onClose: () => void;
}

export function EditUserDialog({
  isOpen,
  user,
  setUser,
  sites,
  onSave,
  onClose,
}: EditUserDialogProps) {
  if (!isOpen || !user) return null;

  // Convert UI role to backend role for display in select
  const uiRoleToBackend = (uiRole: string): string => {
    switch (uiRole) {
      case "Admin":
        return "admin";
      case "Super User":
        return "superuser";
      case "Agent de saisie":
        return "agent";
      case "User":
        return "user";
      default:
        return uiRole.toLowerCase(); // fallback
    }
  };

  // Convert backend role to UI role for state management
  const backendRoleToUI = (backendRole: string): string => {
    switch (backendRole) {
      case "admin":
        return "Admin";
      case "superuser":
        return "Super User";
      case "agent":
        return "Agent de saisie";
      case "user":
        return "User";
      default:
        return backendRole;
    }
  };

  // Get current backend role for the select element
  const getCurrentBackendRole = (): string => {
    return uiRoleToBackend(user.role);
  };

  // Ensure user has sites array populated
  // If sites array is empty but site string exists, try to find the site ID
  const getCurrentUserSites = (): number[] => {
    if (user.sites && user.sites.length > 0) {
      return user.sites;
    }

    // If no sites array but has site string, try to find the site ID
    if (user.site) {
      const foundSite = sites.find((s) => s.name === user.site);
      return foundSite ? [foundSite.id] : [];
    }

    return [];
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h3>Edit User</h3>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-grid-2">
            <div className="form-field">
              <label>Username</label>
              <input
                type="text"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>First Name</label>
              <input
                type="text"
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
              />
            </div>

            <div className="form-field">
              <label>Last Name</label>
              <input
                type="text"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              />
            </div>

            <div className="form-field full-width">
              <label>Sites</label>
              <SiteComboBox
                isMulti={true}
                value={getCurrentUserSites()}
                onChange={(selectedSites) => {
                  const sitesArray = Array.isArray(selectedSites)
                    ? selectedSites
                    : [];
                  // Find the first site name for backward compatibility with the display
                  const primarySiteName =
                    sitesArray.length > 0
                      ? sites.find((s) => s.id === sitesArray[0])?.name || ""
                      : "";
                  setUser({
                    ...user,
                    sites: sitesArray,
                    site: primarySiteName,
                  });
                }}
                placeholder="Sélectionner les sites..."
                isClearable={true}
              />
            </div>

            <div className="form-field">
              <label>Role</label>
              <select
                value={getCurrentBackendRole()}
                onChange={(e) => {
                  const backendRole = e.target.value;
                  const uiRole = backendRoleToUI(backendRole);
                  setUser({ ...user, role: uiRole });
                }}
              >
                <option value="user">User</option>
                <option value="agent">Agent de saisie</option>
                <option value="superuser">Super User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserDialog;
