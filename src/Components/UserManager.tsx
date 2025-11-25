import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string;
  role: string;
}

interface UserManagerProps {
  users: User[];
  searchQuery: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
}

export function UserManager({
  users,
  searchQuery,
  onSearch,
  onAdd,
  onDelete,
  onEdit,
}: UserManagerProps) {
  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        [u.username, u.firstName, u.lastName, u.email, u.site, u.role]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [users, searchQuery],
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

          <button className="btn-primary" onClick={onAdd}>
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
                <td>{user.site}</td>
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
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => {
                        onDelete(user.id);
                      }}
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
