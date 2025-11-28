import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string;
  sites?: number[]; // Add sites array support
  role: string;
}

interface UserManagerProps {
  users: User[];
  searchQuery: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
  sites?: Array<{ id: number; name: string }>; // Add sites prop to get site names
  canManageUsers?: boolean; // Add permission check prop
}

export function UserManager({
  users,
  searchQuery,
  onSearch,
  onAdd,
  onDelete,
  onEdit,
  sites = [],
  canManageUsers = false,
}: UserManagerProps) {
  // Helper function to get site name by ID
  const getSiteName = (siteId: number): string => {
    const site = sites.find((s) => s.id === siteId);
    return site ? site.name : `Site ${siteId}`;
  };
  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const searchText = [
          u.username,
          u.firstName,
          u.lastName,
          u.email,
          u.site,
          u.role,
          // Include sites array in search with actual site names
          ...(u.sites ? u.sites.map((siteId) => getSiteName(siteId)) : []),
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(searchQuery.toLowerCase());
      }),
    [users, searchQuery, sites, getSiteName],
  );

  return (
    <>
      <div className="panel-header-row">
        <div className="toolbar">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
            />
          </div>

          <button
            className="btn-primary"
            onClick={onAdd}
            disabled={!canManageUsers}
            title={
              canManageUsers
                ? "Ajouter un utilisateur"
                : "Seuls les Admins et Superusers peuvent ajouter des utilisateurs"
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th> {/* ✅ Added ID column for debugging */}
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Site</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {/* ✅ Display ID for debugging */}
                  <span
                    style={{
                      fontSize: "12px",
                      background: "#f0f0f0",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    {user.id}
                  </span>
                </td>
                <td>{user.username}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>
                  {/* Display multiple sites if available, otherwise show single site */}
                  {user.sites && user.sites.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                    >
                      {user.sites.map((siteId, index) => (
                        <span
                          key={siteId}
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "3px",
                            color: "#374151",
                          }}
                        >
                          {getSiteName(siteId)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    user.site
                  )}
                </td>
                <td>
                  <span
                    className={`role-badge ${user.role
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => onEdit(user)}
                      disabled={!canManageUsers}
                      title={
                        canManageUsers
                          ? "Éditer l'utilisateur"
                          : "Seuls les Admins et Superusers peuvent éditer des utilisateurs"
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => {
                        onDelete(user.id);
                      }}
                      disabled={!canManageUsers}
                      title={
                        canManageUsers
                          ? "Supprimer l'utilisateur"
                          : "Seuls les Admins et Superusers peuvent supprimer des utilisateurs"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UserManager;
