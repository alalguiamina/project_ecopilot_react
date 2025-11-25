import React from "react";
import Select, { components, SingleValue } from "react-select";
import { useGetSites } from "../hooks/useGetSites";
import type { Site } from "../types/site";

interface SiteOption {
  value: number;
  label: string;
  siteData: Site;
}

interface SiteComboBoxProps {
  // Selection props
  value?: number | null;
  onChange: (selected: number | null) => void;

  // UI props
  placeholder?: string;
  inputId?: string;
  className?: string;
  isDisabled?: boolean;
  isClearable?: boolean;

  // Filtering props
  excludeSiteIds?: number[]; // Exclude specific site IDs
  filterByValidation?: boolean; // Filter by double validation requirement
}

export function SiteComboBox({
  value,
  onChange,
  placeholder = "Choisir un site...",
  inputId,
  className,
  isDisabled = false,
  isClearable = true,
  excludeSiteIds = [],
  filterByValidation,
}: SiteComboBoxProps) {
  const { data: sites = [], isLoading, error } = useGetSites();

  // Filter and map sites to options
  const siteOptions: SiteOption[] = React.useMemo(() => {
    let filteredSites = sites;

    // Exclude specific site IDs
    if (excludeSiteIds.length > 0) {
      filteredSites = filteredSites.filter(
        (site) => !excludeSiteIds.includes(site.id),
      );
    }

    // Filter by validation requirement if specified
    if (filterByValidation !== undefined) {
      filteredSites = filteredSites.filter(
        (site) => site.require_double_validation === filterByValidation,
      );
    }

    return filteredSites.map((site) => ({
      value: site.id,
      label: site.name,
      siteData: site,
    }));
  }, [sites, excludeSiteIds, filterByValidation]);

  // Custom Option component with validation badges
  const Option = (props: any) => {
    const { data } = props;
    const validationStyle = data.siteData.require_double_validation
      ? { background: "#fef3c7", color: "#d97706" }
      : { background: "#d1fae5", color: "#059669" };

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
              ...validationStyle,
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
              marginLeft: 8,
              fontWeight: "500",
            }}
          >
            {data.siteData.require_double_validation
              ? "Double validation"
              : "Simple"}
          </span>
        </div>
      </components.Option>
    );
  };

  // Custom SingleValue component to show validation info in selected value
  const SingleValue = (props: any) => {
    const { data } = props;
    return (
      <components.SingleValue {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{data.label}</span>
          <span
            style={{
              fontSize: "11px",
              padding: "1px 4px",
              borderRadius: 4,
              backgroundColor: data.siteData.require_double_validation
                ? "#fef3c7"
                : "#d1fae5",
              color: data.siteData.require_double_validation
                ? "#d97706"
                : "#059669",
            }}
          >
            {data.siteData.require_double_validation ? "DV" : "SV"}
          </span>
        </div>
      </components.SingleValue>
    );
  };

  // Handle value conversion for controlled component
  const getSelectValue = () => {
    const selectedId = typeof value === "number" ? value : null;
    return selectedId
      ? siteOptions.find((option) => option.value === selectedId) || null
      : null;
  };

  // Handle change events
  const handleChange = (selected: SingleValue<SiteOption>) => {
    onChange(selected ? selected.value : null);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "8px", color: "#6b7280", fontSize: "14px" }}>
        Loading sites...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "8px", color: "#dc2626", fontSize: "14px" }}>
        Error loading sites
      </div>
    );
  }

  return (
    <Select
      inputId={inputId}
      className={className}
      options={siteOptions}
      isDisabled={isDisabled}
      isClearable={isClearable}
      components={{ Option, SingleValue }}
      placeholder={placeholder}
      value={getSelectValue()}
      onChange={handleChange}
      isSearchable={true}
      styles={{
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
        control: (provided, state) => ({
          ...provided,
          borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
          boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
          "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
          },
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? "#3b82f6"
            : state.isFocused
              ? "#eff6ff"
              : "white",
          color: state.isSelected ? "white" : "#374151",
          cursor: "pointer",
        }),
      }}
    />
  );
}

export default SiteComboBox;
