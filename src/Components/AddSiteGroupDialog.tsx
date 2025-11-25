import { X } from "lucide-react";
// use relative path to your organisation types
import { SiteGroup, UserData } from "../types/organisation";

interface AddSiteGroupDialogProps {
  isOpen: boolean;
  newGroup: SiteGroup;
  setNewGroup: (g: SiteGroup) => void;
  onAddGroup: () => void;
  onClose: () => void;
}

export function AddSiteGroupDialog({
  isOpen,
  newGroup,
  setNewGroup,
  onAddGroup,
  onClose,
}: AddSiteGroupDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h3>Ajouter une Unité</h3>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-grid-2">
            {/* Removed the previous site select. Keep a single text field (was "Unité"), now renamed "Site".
                This field (newGroup.name) is the site name associated with backend. */}
            <div className="form-field">
              <label htmlFor="group-name">Site</label>
              <input
                id="group-name"
                type="text"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                placeholder="Enter site name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="group-type">Type</label>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <select
                  id="group-type"
                  value={newGroup.type}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      type: e.target.value as "Interne" | "Externe",
                    })
                  }
                  style={{ minWidth: 160 }}
                >
                  <option value="Interne">Interne</option>
                  <option value="Externe">Externe</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Niveau de validation</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={((newGroup as any).validationLevel ?? 0) === 1}
                    onChange={() => {
                      const current = (newGroup as any).validationLevel ?? 0;
                      const next = current === 1 ? 0 : 1;
                      setNewGroup({
                        ...newGroup,
                        ...({ validationLevel: next } as any),
                      });
                    }}
                  />
                  <span style={{ fontSize: 13 }}>1</span>
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={((newGroup as any).validationLevel ?? 0) === 2}
                    onChange={() => {
                      const current = (newGroup as any).validationLevel ?? 0;
                      const next = current === 2 ? 0 : 2;
                      setNewGroup({
                        ...newGroup,
                        ...({ validationLevel: next } as any),
                      });
                    }}
                  />
                  <span style={{ fontSize: 13 }}>2</span>
                </label>
              </div>
            </div>

            <div className="form-field full-width">
              <label htmlFor="group-desc">Description</label>
              <input
                id="group-desc"
                type="text"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                placeholder=" Enter description"
              />
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-primary" onClick={onAddGroup}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
export default AddSiteGroupDialog;
