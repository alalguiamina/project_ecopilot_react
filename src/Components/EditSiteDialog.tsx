import React from "react";
import { X } from "lucide-react";
import type { Site } from "../types/site";
import type { UpdateSiteRequest } from "../hooks/useUpdateSite";

interface EditSiteDialogProps {
  isOpen: boolean;
  site: Site | null;
  onSave: (id: number, data: UpdateSiteRequest) => void;
  onClose: () => void;
}

export function EditSiteDialog({
  isOpen,
  site,
  onSave,
  onClose,
}: EditSiteDialogProps) {
  // local form state
  const [form, setForm] = React.useState({
    name: "",
    require_double_validation: false,
    config_json: {},
  });
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  // initialize form with site data when dialog opens
  React.useEffect(() => {
    if (isOpen && site) {
      setValidationError(null);
      setForm({
        name: site.name || "",
        require_double_validation: site.require_double_validation || false,
        config_json: site.config_json || {},
      });
    }
  }, [isOpen, site]);

  if (!isOpen || !site) return null;

  function handleSave(): void {
    setValidationError(null);

    // Add null check since TypeScript correctly identifies site could be null
    if (!site) {
      setValidationError("No site selected.");
      return;
    }

    const name = form.name.trim();
    if (!name) {
      setValidationError("Site name is required.");
      return;
    }

    const updateData: UpdateSiteRequest = {
      name,
      require_double_validation: form.require_double_validation,
      config_json: form.config_json,
    };

    onSave(site.id, updateData);
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h3>Edit Site</h3>
          <button
            className="btn-icon"
            onClick={() => {
              setValidationError(null);
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-grid-1">
            <div className="form-field">
              <label htmlFor="site-name">Site Name</label>
              <input
                id="site-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter site name"
              />
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.require_double_validation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      require_double_validation: e.target.checked,
                    })
                  }
                />
                <span>Require Double Validation</span>
              </label>
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
          <button
            className="btn-secondary"
            onClick={() => {
              setValidationError(null);
              onClose();
            }}
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Update Site
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSiteDialog;
