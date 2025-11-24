// Components/EntityManager.tsx
import { Plus, Edit, Trash2 } from "lucide-react";
import { UserData } from "../types/organisation";

interface FieldConfig<T> {
  key: keyof T;
  label: string;
  placeholder: string;
  type?: string;
}

interface EntityManagerProps<T> {
  title: string;
  data: T[];
  fields: FieldConfig<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchPlaceholder?: string;
  formatField?: (key: keyof T, value: any) => string;
  extraActionButton?: React.ReactNode;
}

export function EntityManager<T extends { id: number | string }>({
  title,
  data,
  fields,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = `Search ${title.toLowerCase()}...`,
  formatField,
  extraActionButton,
}: EntityManagerProps<T>) {
  return (
    <div className="entity-manager">
      <div className="panel-header-row">
        <div className="toolbar">
          <div className="search-bar">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => console.log("search something", e.target.value)}
            />
          </div>

          {extraActionButton}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {fields.map((f, idx) => (
                <th key={idx}>{f.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {fields.map((f, idx) => (
                  <td key={idx}>
                    {formatField
                      ? formatField(f.key, item[f.key])
                      : Array.isArray(item[f.key])
                        ? (item[f.key] as any[]).join(", ")
                        : String(item[f.key])}
                  </td>
                ))}
                <td className="actions-cell">
                  {onEdit && (
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => onDelete(item)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default EntityManager;
