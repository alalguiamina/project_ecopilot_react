import React from "react";
import Select, { components, MultiValue, SingleValue } from "react-select";
import { useGetUsers } from "../hooks/useGetUsers";
import type { User as BackendUser } from "../types/user";

interface UserOption {
  value: number;
  label: string;
  role: string;
  userData: BackendUser;
}

interface UserComboBoxProps {
  // Selection props
  isMulti?: boolean; // Defaults to true for multi-select
  value?: number | number[] | null;
  onChange: (selected: number | number[] | null) => void;

  // UI props
  placeholder?: string;
  inputId?: string;
  className?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  closeMenuOnSelect?: boolean;

  // Filtering props
  filterByRole?: string[]; // Defaults to ["admin", "user", "superuser"]
  excludeUserIds?: number[]; // Exclude specific user IDs
}

export function UserComboBox({
  isMulti = true, // ✅ Changed default to true for multi-select
  value,
  onChange,
  placeholder = "Sélectionner des utilisateurs...",
  inputId,
  className,
  isDisabled = false,
  isClearable = true,
  closeMenuOnSelect,
  filterByRole = ["admin", "user", "superuser"], // ✅ Default to show only these roles
  excludeUserIds = [],
}: UserComboBoxProps) {
  const { data: backendUsers = [], isLoading, error } = useGetUsers();

  // Convert backend user to UI user shape with role mapping
  const backendRoleToUI = (r: string) => {
    switch (r) {
      case "admin":
        return "Admin";
      case "superuser":
        return "Super User";
      case "agent":
        return "Agent de saisie";
      default:
        return "User";
    }
  };

  // Filter and map users to options
  const userOptions: UserOption[] = React.useMemo(() => {
    let filteredUsers = backendUsers;

    // Filter by role if specified
    if (filterByRole && filterByRole.length > 0) {
      filteredUsers = filteredUsers.filter((user) =>
        filterByRole.includes(user.role),
      );
    }

    // Exclude specific user IDs
    if (excludeUserIds.length > 0) {
      filteredUsers = filteredUsers.filter(
        (user) => !excludeUserIds.includes(user.id),
      );
    }

    return filteredUsers.map((user) => {
      // Handle cases where firstName/lastName might be empty
      const firstName = user.first_name?.trim() || "";
      const lastName = user.last_name?.trim() || "";

      // Create a proper display name
      let displayName = "";
      if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
      } else if (firstName || lastName) {
        displayName = firstName || lastName;
      } else {
        displayName = user.username; // Fallback to username if no names
      }

      return {
        value: user.id,
        label: `${displayName} (${user.username})`,
        role: backendRoleToUI(user.role),
        userData: user,
      };
    });
  }, [backendUsers, filterByRole, excludeUserIds]);

  // Custom Option component with role badges
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

    const roleStyle = getRoleStyle(data.role || "User");
    return (
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{data.label}</span>
          <span
            style={{
              ...roleStyle,
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
              marginLeft: 8,
              fontWeight: "500",
            }}
          >
            {data.role || "User"}
          </span>
        </div>
      </components.Option>
    );
  };

  // Handle value conversion for controlled component
  const getSelectValue = () => {
    if (isMulti) {
      const selectedIds = Array.isArray(value) ? value : [];
      return userOptions.filter((option) => selectedIds.includes(option.value));
    } else {
      const selectedId = typeof value === "number" ? value : null;
      return selectedId
        ? userOptions.find((option) => option.value === selectedId) || null
        : null;
    }
  };

  // Handle change events
  const handleChange = (
    selected: MultiValue<UserOption> | SingleValue<UserOption>,
  ) => {
    if (isMulti) {
      const selectedArray = selected as MultiValue<UserOption>;
      const ids = selectedArray.map((option) => option.value);
      onChange(ids);
    } else {
      const singleSelected = selected as SingleValue<UserOption>;
      onChange(singleSelected ? singleSelected.value : null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "8px", color: "#6b7280", fontSize: "14px" }}>
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "8px", color: "#dc2626", fontSize: "14px" }}>
        Error loading users
      </div>
    );
  }

  return (
    <Select
      inputId={inputId}
      className={className}
      options={userOptions}
      isMulti={isMulti}
      isDisabled={isDisabled}
      isClearable={isClearable}
      closeMenuOnSelect={closeMenuOnSelect ?? !isMulti}
      components={{ Option }}
      placeholder={placeholder}
      value={getSelectValue()}
      onChange={handleChange}
      styles={{
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
        multiValueLabel: (styles) => ({
          ...styles,
          fontWeight: "bold",
        }),
        control: (provided, state) => ({
          ...provided,
          borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
          boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
          "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
          },
        }),
      }}
    />
  );
}

export default UserComboBox;
