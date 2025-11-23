import React from "react";
import { X } from "lucide-react";
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
  // Hooks must be declared unconditionally
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  if (!isOpen) return null;

  function handleSave(): void {
    setValidationError(null);

    const username = (newUser.username ?? "").toString().trim();
    const password = (newUser.password ?? "").toString();
    // normalize sites to number[]
    const sitesArr: number[] = Array.isArray(newUser.sites)
      ? (newUser.sites as Array<any>).map((s) => Number(s))
      : newUser.site
        ? [Number(newUser.site)]
        : [];

    if (!username || !password || sitesArr.length === 0) {
      setValidationError(
        "Please fill required fields (username, password, site).",
      );
      return;
    }

    // validate selected site ids exist in provided sites list
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
      role: (newUser.role ?? "user").toString(),
      sites: sitesArr,
    };

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
          <div className="form-grid-2">
            {/* USERNAME - ensure this is the field used for backend username */}
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={newUser.username ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={newUser.email ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={newUser.firstName ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                placeholder="Enter first name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={newUser.lastName ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                placeholder="Enter last name"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={newUser.password ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Enter password"
              />
            </div>

            <div className="form-field">
              <label htmlFor="user-site">Site</label>
              <select
                id="user-site"
                value={
                  Array.isArray(newUser.sites) && newUser.sites[0] !== undefined
                    ? String(newUser.sites[0])
                    : newUser.site !== undefined
                      ? String(newUser.site)
                      : ""
                }
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    site: Number(e.target.value),
                    sites: [Number(e.target.value)],
                  })
                }
              >
                <option value="">Select site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={newUser.role ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="agent">Agent de saisie</option>
                <option value="user">User</option>
                <option value="super_user">Super User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
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
