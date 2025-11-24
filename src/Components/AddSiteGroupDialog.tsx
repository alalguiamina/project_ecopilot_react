import { X } from "lucide-react";
import Select, { components } from "react-select";
// use relative path to your organisation types
import { SiteGroup, UserData } from "../types/organisation";

interface AddSiteGroupDialogProps {
  isOpen: boolean;
  newGroup: SiteGroup;
  people: UserData[];
  setNewGroup: (g: SiteGroup) => void;
  onAddGroup: () => void;
  onClose: () => void;
}

export function AddSiteGroupDialog({
  isOpen,
  newGroup,
  setNewGroup,
  people,
  onAddGroup,
  onClose,
}: AddSiteGroupDialogProps) {
  if (!isOpen) return null;
  // Build dropdown options from people
  const memberOptions = people.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} (${p.username})`,
    role: p.role,
  }));

  const Option = (props: any) => {
    const { data } = props;
    const getRoleStyle = (role: string) => {
      switch (role) {
        case "Admin":
          return { background: "#fee2e2", color: "#b91c1c" };
        case "Super User":
          return { background: "#f3e8ff", color: "#7e22ce" };
        case "User":
          return { background: "#dbeafe", color: "#1d4ed8" };
        case "Agent de saisie":
          return { background: "#dcfce7", color: "#15803d" };
        default:
          return { background: "#e2e8f0", color: "#475569" };
      }
    };

    const roleStyle = getRoleStyle(data.role);
    return (
      <components.Option {...props}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{data.label}</span>
          <span
            style={{
              ...roleStyle,
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
              marginLeft: 8,
            }}
          >
            {data.role}
          </span>
        </div>
      </components.Option>
    );
  };

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

            <div className="form-field full-width">
              <label htmlFor="members">Affecter des personnes</label>

              <Select
                inputId="members"
                options={memberOptions}
                isMulti
                closeMenuOnSelect={false}
                components={{ Option }}
                placeholder="Sélectionner des utilisateurs..."
                value={memberOptions.filter((o) =>
                  newGroup.members.includes(o.value),
                )}
                onChange={(selected: any) => {
                  const ids = selected.map((s: any) => s.value);
                  setNewGroup({ ...newGroup, members: ids });
                }}
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  multiValueLabel: (styles) => ({
                    ...styles,
                    fontWeight: "bold",
                  }),
                }}
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
