import React from "react";
import { X } from "lucide-react";
import { SiteComboBox } from "./SiteComboBox";
import type { Site, NewUser } from "../types/organisation";
import type { CreateUserRequest } from "../types/user";

interface AddUserDialogProps {
  isOpen: boolean;
  newUser: NewUser;
  setNewUser: React.Dispatch<React.SetStateAction<NewUser>>;
  sites: Site[];
  onSave: (payload: CreateUserRequest) => void;
  onClose: () => void;
}

export function AddUserDialog({
  isOpen,
  newUser,
  setNewUser,
  sites,
  onSave,
  onClose,
}: AddUserDialogProps) {
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  if (!isOpen) return null;

  function handleSave(): void {
    setValidationError(null);

    // ✅ FIX: Capture current state immediately at click time
    const currentUser = newUser;

    const username = (currentUser.username ?? "").toString().trim();
    const password = (currentUser.password ?? "").toString();
    const role = currentUser.role;

    console.log("🔍 At save time - role:", role);
    console.log("🔍 At save time - full user:", currentUser);

    if (!role) {
      setValidationError("Role missing");
      return;
    }

    const sitesArr: number[] = Array.isArray(currentUser.sites)
      ? currentUser.sites.map((site) =>
          typeof site === "number" ? site : Number(site),
        )
      : currentUser.site
        ? [Number(currentUser.site)]
        : [];

    if (!username || !password || !role || sitesArr.length === 0) {
      setValidationError(
        "Please fill required fields (username, password, role, sites).",
      );
      return;
    }

    const valid = sitesArr.every((id) =>
      sites.some((s) => Number(s.id) === id),
    );
    if (!valid) {
      setValidationError("Selected site invalid.");
      return;
    }

    const payload: CreateUserRequest = {
      username,
      password,
      role,
      sites: sitesArr,
    };

    console.log("🔍 Debug - payload being sent:", payload);

    onSave(payload);
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h3>Add New User</h3>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="dialog-content">
          <form autoComplete="off">
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="user-name-field"
                  type="text"
                  value={newUser.username ?? ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="user-email-field"
                  type="email"
                  value={newUser.email ?? ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email"
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="user-first-name-field"
                  type="text"
                  value={newUser.firstName ?? ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                  autoComplete="off"
                />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="user-last-name-field"
                  type="text"
                  value={newUser.lastName ?? ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                  autoComplete="off"
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="user-password-field"
                  type="password"
                  value={newUser.password ?? ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter password"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="user-sites">Sites</label>
                <SiteComboBox
                  inputId="user-sites"
                  isMulti={true}
                  value={(newUser.sites || []) as number[]}
                  onChange={(selectedSites) => {
                    const sitesArray = Array.isArray(selectedSites)
                      ? selectedSites
                      : [];
                    setNewUser({
                      ...newUser,
                      sites: sitesArray,
                      site: sitesArray.length > 0 ? sitesArray[0] : undefined,
                    });
                  }}
                  placeholder="Sélectionner les sites..."
                  isClearable={true}
                />
              </div>

              <div className="form-field">
                <label htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  name="user-role-field"
                  value={newUser.role ?? "user"}
                  onChange={(e) => {
                    console.log(
                      "🔄 Role changing from:",
                      newUser.role,
                      "to:",
                      e.target.value,
                    );
                    const newRole = e.target.value;
                    setNewUser((prev) => {
                      const updated = { ...prev, role: newRole };
                      console.log("🔄 Updated user state:", updated);
                      return updated;
                    });
                  }}
                  autoComplete="off"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent de saisie</option>
                  <option value="superuser">Super User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {validationError && (
          <div
            className="validation-error"
            style={{ color: "#b91c1c", padding: "8px 16px" }}
          >
            {validationError}
          </div>
        )}

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUserDialog;
