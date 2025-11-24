import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import UserManager from "../UserManager";
import AddUserDialog from "../AddUserDialog";
import EditUserDialog from "../EditUserDialog";
import EditSiteDialog from "../EditSiteDialog";
import {
  useGetUsers,
  useCreateUser,
  usePartialUpdateUser,
  useDeleteUser,
  useGetSites,
  useCreateSite,
} from "../../hooks";
import { useUpdateSite } from "../../hooks/useUpdateSite";
import type { UpdateSiteRequest } from "../../hooks/useUpdateSite";
import type {
  Site,
  SiteGroup,
  UserData,
  NewUser,
} from "../../types/organisation";
import type {
  User as BackendUser,
  CreateUserRequest,
  PartialUpdateUserRequest,
} from "../../types/user";
import "./OrganisationPage.css";
import { Building2, MapPin, Plus, Users, X } from "lucide-react";
import Sidebar from "Components/Sidebar/Sidebar";
import Topbar from "Components/Topbar/Topbar";
import { EntityManager } from "Components/EntityManager";
import { ExpandablePanel } from "Components/ExpandablePanel";
import { createEntityFormatter } from "Utils/formatter";
import AddSiteGroupDialog from "Components/AddSiteGroupDialog";
import useDeleteSite from "hooks/useDeleteSite";

interface OrganisationPageProps {
  user: BackendUser; // current logged-in user (do not shadow with other vars)
}

const OrganisationPage = ({ user: currentUser }: OrganisationPageProps) => {
  const navigate = useNavigate();
  const handleLogout = () => navigate("/");
  const pageTitle = usePageTitle();
  const topbarProps = {
    title: pageTitle,
    userName:
      (currentUser && (currentUser.first_name || currentUser.username)) ||
      "User",
    onLogout: handleLogout,
  };

  // Panel expansion states
  const [expandedPanel, setExpandedPanel] = useState<"org" | "users" | null>(
    null,
  );

  // Sites (still local/static for now — you can fetch sites similarly later)
  const { data: sites = [] } = useGetSites();
  const { data: siteGroups = [] } = useGetSites(); // kept if you still need groups
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  // keep deleteSiteGroup if you still delete groups elsewhere
  const deleteSiteGroup = useDeleteSite();

  // keep local newGroup state for dialog inputs
  const [newGroup, setNewGroup] = useState<SiteGroup>({
    name: "",
    description: "",
    type: "Interne",
    siteId: 0,
    members: [],
  });
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // --- USERS: now driven by backend hooks (no local hardcoded users) ---
  const { data: backendUsers = [], isLoading: usersLoading } = useGetUsers();
  const createUser = useCreateUser();
  const partialUpdateUser = usePartialUpdateUser();
  const deleteUser = useDeleteUser();

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditSiteDialogOpen, setIsEditSiteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // UI user form state (for Add)
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    site: "",
    role: "User",
  });

  // Currently edited user in UI shape
  const [userBeingEdited, setUserBeingEdited] = useState<UserData | null>(null);

  // ROLE mapping between UI labels and backend values
  const uiRoleToBackend = (r: string) => {
    switch (r) {
      case "Admin":
        return "admin";
      case "Super User":
        return "super_user";
      case "Agent de saisie":
        return "agent";
      default:
        return "user";
    }
  };
  const backendRoleToUI = (r: string) => {
    switch (r) {
      case "admin":
        return "Admin";
      case "super_user":
        return "Super User";
      case "agent":
        return "Agent de saisie";
      default:
        return "User";
    }
  };

  // Helpers to map site name/id <-> id/name
  // Accept either a site name (string) or an id (number) as input.
  const siteNameToId = (input?: string | number) => {
    if (typeof input === "number" && input > 0) return input;
    if (!input) return 0;
    const name = String(input);
    return sites.find((s) => s.name === name)?.id ?? 0;
  };

  const siteIdToName = (id?: number) =>
    sites.find((s) => s.id === id)?.name ?? "";

  // Convert backend user to UI user shape
  const backendToUI = (u: BackendUser): UserData => ({
    id: u.id,
    username: u.username,
    firstName: (u.first_name as string) || "",
    lastName: (u.last_name as string) || "",
    email: u.email || "",
    site: siteIdToName(u.sites?.[0]), // assume single-site users; show site name or empty
    role: backendRoleToUI(u.role),
    password: undefined,
  });

  // Derived list for UI components
  const uiUsers = useMemo(
    () => backendUsers.map(backendToUI),
    [backendUsers, sites],
  );

  // Filter users based on search (can reuse existing UserManager filtering but keep this for other uses)
  const filteredUsers = uiUsers.filter((u) =>
    [u.username, u.firstName, u.lastName, u.email, u.site, u.role]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // ---- Handlers that call backend ----

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.site) {
      alert("Please fill required fields (username, password, site).");
      return;
    }
    const siteId = siteNameToId(newUser.site);
    if (!siteId) {
      alert("Selected site invalid.");
      return;
    }

    const payload: CreateUserRequest = {
      username: newUser.username,
      password: newUser.password,
      role: uiRoleToBackend(newUser.role),
      sites: [siteId],
    };

    createUser.mutate(payload, {
      onSuccess: () => {
        setNewUser({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          site: "",
          role: "user",
        });
        setIsAddDialogOpen(false);
      },
      onError: (err) => {
        console.error("Create user failed", err);
        alert("Failed to create user");
      },
    });
  };

  const handleEditUser = (u: UserData) => {
    // open edit dialog with a cloned UI user object
    setUserBeingEdited({ ...u });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userBeingEdited) return;

    // prepare partial payload using backend field names
    const siteId = userBeingEdited.site
      ? siteNameToId(userBeingEdited.site)
      : undefined;
    const payload: PartialUpdateUserRequest = {
      username: userBeingEdited.username,
      role: uiRoleToBackend(userBeingEdited.role),
      sites: siteId ? [siteId] : [],
      email: userBeingEdited.email,
      first_name: userBeingEdited.firstName,
      last_name: userBeingEdited.lastName,
    };

    partialUpdateUser.mutate(
      { userId: userBeingEdited.id, userData: payload },
      {
        onSuccess: () => {
          setUserBeingEdited(null);
          setIsEditDialogOpen(false);
        },
        onError: (err) => {
          console.error("Update user failed", err);
          alert("Failed to update user");
        },
      },
    );
  };

  const handleDeleteUser = (id: number) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    deleteUser.mutate(id, {
      onError: (err) => {
        console.error("Delete user failed", err);
        alert("Failed to delete user");
      },
    });
  };

  // Create an actual Site in backend when dialog saved.
  const handleAddGroup = () => {
    if (!newGroup.name) {
      alert("Please enter a site name");
      return;
    }

    const payload = {
      name: newGroup.name,
      require_double_validation: ((newGroup as any).validationLevel ?? 0) === 2,
      config_json: {},
    };

    createSite.mutate(payload, {
      onSuccess: () => {
        setNewGroup({
          name: "",
          description: "",
          type: "Interne",
          siteId: 0,
          members: [],
        });
        setIsAddGroupOpen(false);
      },
      onError: (err: any) => {
        console.error("Create site failed (mutation error):", err);
        // err is an Error thrown in hook => show message
        alert(
          "Failed to create site: " + (err?.message ?? JSON.stringify(err)),
        );
      },
    });
  };

  const handleDeleteGroup = (id: number) => {
    if (!window.confirm("Supprimer ce groupe ?")) return;
    deleteSiteGroup.mutate(id, {
      onError: (err: any) => {
        console.error("Delete group failed", err);
        alert("Failed to delete group");
      },
    });
  };

  const formatSiteGroupField = createEntityFormatter(sites, uiUsers as any);

  const Badge = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return <span className={`badge ${className}`}>{children}</span>;
  };

  const entityConfigs = [
    {
      id: "site-groups",
      title: "Groupes de Site",
      fields: [
        { key: "name", label: "Nom de l'unité", placeholder: "Entrer le nom" },
        {
          key: "description",
          label: "Description",
          placeholder: "Entrer la description",
        },
        { key: "type", label: "Type", placeholder: "Interne / Externe" },
        { key: "siteId", label: "Site", placeholder: "ID du site" },
        { key: "members", label: "Membres", placeholder: "Liste des membres" },
      ],
      // show site groups if you need them; otherwise you can show `sites` here
      items: siteGroups,
      newItem: newGroup,
      setNewItem: setNewGroup as any,
      onAdd: handleAddGroup,
      onDelete: handleDeleteGroup,
    },
  ];

  const handleEditSite = (site: Site) => {
    setSelectedSite(site);
    setIsEditSiteDialogOpen(true);
  };

  const handleUpdateSite = async (id: number, data: UpdateSiteRequest) => {
    try {
      await updateSite.mutateAsync({ id, data });
      setIsEditSiteDialogOpen(false);
      setSelectedSite(null);
      console.log("Site updated successfully");
    } catch (error) {
      console.error("Failed to update site:", error);
      alert("Failed to update site");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar user={currentUser} />

      <div className="dashboard-content">
        <Topbar {...topbarProps} />
        <main className="main-dashboard">
          <div className="organisation-page">
            <div className="page-header">
              <p>Gestion des unités organisationnelles et des utilisateurs</p>
            </div>

            {/* User Management Panel */}
            <ExpandablePanel
              id="users"
              title="Gestion d'Utilisateur"
              description="Administration des comptes utilisateurs et permissions"
              icon={<span className="icon">👥</span>}
              color="purple"
              metricValue={uiUsers.length}
              metricLabel="Utilisateurs actifs"
              expandedPanel={expandedPanel as string | null}
              setExpandedPanel={
                setExpandedPanel as (panel: string | null) => void
              }
            >
              <UserManager
                users={filteredUsers}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                onAdd={() => setIsAddDialogOpen(true)}
                onDelete={handleDeleteUser}
                onEdit={handleEditUser}
              />

              {/* ADD USER DIALOG */}
              {isAddDialogOpen && (
                <AddUserDialog
                  isOpen={isAddDialogOpen}
                  newUser={newUser}
                  setNewUser={setNewUser}
                  sites={sites as Site[]}
                  onSave={handleAddUser}
                  onClose={() => setIsAddDialogOpen(false)}
                />
              )}

              {/* EDIT USER DIALOG */}
              {isEditDialogOpen && userBeingEdited && (
                <EditUserDialog
                  isOpen={isEditDialogOpen}
                  user={userBeingEdited}
                  setUser={(updated) => setUserBeingEdited(updated)}
                  sites={sites as Site[]}
                  onSave={handleSaveUser}
                  onClose={() => {
                    setIsEditDialogOpen(false);
                    setUserBeingEdited(null);
                  }}
                />
              )}
            </ExpandablePanel>

            {/* Organisation Panel */}
            <ExpandablePanel
              id="org"
              title="Unités"
              description="Gestion des sites"
              icon={<span className="icon">🏢</span>}
              color="blue"
              metricValue={sites.length}
              metricLabel="Unités totales"
              expandedPanel={expandedPanel as string | null}
              setExpandedPanel={
                setExpandedPanel as (panel: string | null) => void
              }
            >
              <div className="single-panel">
                <EntityManager
                  title="Sites"
                  fields={[
                    {
                      key: "name" as any,
                      label: "Nom",
                      placeholder: "Nom du site",
                    },
                    {
                      key: "location" as any,
                      label: "Localisation",
                      placeholder: "Localisation",
                    },
                    {
                      key: "require_double_validation" as any,
                      label: "Double Validation",
                      placeholder: "true/false",
                    },
                  ]}
                  data={sites as any}
                  onEdit={handleEditSite}
                  onDelete={(site: any) => {
                    alert(
                      `Delete site ${site.name} not implemented — implement useDeleteSite and wire it.`,
                    );
                  }}
                  extraActionButton={
                    <button
                      className="btn-primary"
                      onClick={() => setIsAddGroupOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Ajouter
                    </button>
                  }
                  formatField={(k: any, v: any) =>
                    k === ("require_double_validation" as any)
                      ? v
                        ? "Oui"
                        : "Non"
                      : k === ("location" as any)
                        ? String(v || "")
                        : String(v)
                  }
                />

                {/* Edit Site Dialog */}
                <EditSiteDialog
                  isOpen={isEditSiteDialogOpen}
                  site={selectedSite}
                  onSave={handleUpdateSite}
                  onClose={() => {
                    setIsEditSiteDialogOpen(false);
                    setSelectedSite(null);
                  }}
                />

                {isAddGroupOpen && (
                  <AddSiteGroupDialog
                    isOpen={isAddGroupOpen}
                    newGroup={newGroup}
                    setNewGroup={setNewGroup}
                    people={uiUsers}
                    onAddGroup={handleAddGroup}
                    onClose={() => setIsAddGroupOpen(false)}
                  />
                )}
              </div>
            </ExpandablePanel>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganisationPage;
