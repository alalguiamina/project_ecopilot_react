import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import dashboardIcon from "../../Assets/dashboard.png";
import penIcon from "../../Assets/pen.png";
import leafIcon from "../../Assets/leaf.png";
import chartIcon from "../../Assets/chart.png";
import targetIcon from "../../Assets/target.png";
import reportIcon from "../../Assets/report.png";
import settingsIcon from "../../Assets/settings.png";
import organisationIcon from "../../Assets/organisation.png";
import logo from "../../Assets/logo.png";
import type { User } from "../../App";

interface SidebarProps {
  user?: User | null;
}

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  color: string;
  path?: string;
  children?: MenuItem[];
  adminOnly?: boolean;
};

const Sidebar = ({ user }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: dashboardIcon,
      color: "#3b82f6",
      path: "/dashboard",
    },
    {
      id: "data-entry",
      label: "Saisie de données",
      icon: penIcon,
      color: "#16a34a",
      children: [
        {
          id: "canevas",
          label: "Canevas de Saisie",
          icon: penIcon,
          color: "#16a34a",
          path: "/data-entry/canevas",
        },
        {
          id: "validation",
          label: "Validation de Données",
          icon: penIcon,
          color: "#555",
          path: "/data-entry/validation",
        },
      ],
    },
    {
      id: "carbon",
      label: "Bilan Carbone",
      icon: leafIcon,
      color: "#059669",
      path: "/carbon",
    },
    {
      id: "esg",
      label: "Indicateurs ESG",
      icon: chartIcon,
      color: "#f97316",
      path: "/esg",
    },
    {
      id: "alignment",
      label: "Alignement RSE",
      icon: targetIcon,
      color: "#8b5cf6",
      path: "/alignment",
    },
    {
      id: "reports",
      label: "Rapports RSE",
      icon: reportIcon,
      color: "#b45309",
      path: "/reports",
    },
    {
      id: "organisation",
      label: "Organisation",
      icon: organisationIcon,
      color: "#125a8eff",
      path: "/organisation",
      adminOnly: true,
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: settingsIcon,
      color: "#64748b",
      path: "/settings",
    },
  ];

  // normalize user role for checks
  const userRole = (user?.role ?? "").toString().toLowerCase().trim();
  const isAdmin =
    userRole === "admin" ||
    userRole === "super_user" ||
    userRole === "administrator";

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  // determine active path (safe for optional path)
  const isActive = (path?: string) => !!path && location.pathname === path;

  // Check if any child is active
  const isChildActive = (children?: MenuItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  // Toggle expansion of menu items with children
  const toggleExpansion = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Handle click - expand if has children, navigate if has path
  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpansion(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" />
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={`sidebar-item ${
                isActive(item.path) || isChildActive(item.children)
                  ? "active"
                  : ""
              }`}
              style={
                isActive(item.path) || isChildActive(item.children)
                  ? {
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }
                  : {}
              }
            >
              <img
                src={item.icon}
                alt={item.label}
                className="sidebar-icon"
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "contain",
                  marginRight: "8px",
                }}
              />
              <span className="sidebar-label">{item.label}</span>
              {/* Add expand/collapse indicator for items with children */}
              {item.children && item.children.length > 0 && (
                <span
                  className="expand-indicator"
                  style={{
                    marginLeft: "auto",
                    transform: expandedItems.includes(item.id)
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▶
                </span>
              )}
            </button>

            {/* render children if expanded and has children */}
            {item.children &&
              expandedItems.includes(item.id) &&
              item.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => child.path && navigate(child.path)}
                  className={`sidebar-item sidebar-child ${
                    isActive(child.path) ? "active" : ""
                  }`}
                  style={
                    isActive(child.path)
                      ? {
                          backgroundColor: `${child.color}10`,
                          color: child.color,
                          marginLeft: 20,
                        }
                      : { marginLeft: 20 }
                  }
                >
                  <img
                    src={child.icon}
                    alt={child.label}
                    className="sidebar-icon"
                    style={{
                      width: "20px",
                      height: "20px",
                      objectFit: "contain",
                      marginRight: "8px",
                    }}
                  />
                  <span className="sidebar-label">{child.label}</span>
                </button>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
