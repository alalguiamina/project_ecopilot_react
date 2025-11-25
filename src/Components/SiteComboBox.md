# SiteComboBox Component Documentation

## Overview

A reusable, modern combo box component for selecting sites from the database with validation-based styling and filtering capabilities. Inspired by the UserComboBox design.

## Features

- ✅ **Fetches sites directly from database** using `useGetSites` hook
- ✅ **Modern styling** with validation-based color coding
- ✅ **Searchable/typeable** input with real-time filtering
- ✅ **Validation badges** (Double Validation vs Simple)
- ✅ **Site exclusion** (exclude specific site IDs)
- ✅ **Validation filtering** (show only sites with specific validation requirements)
- ✅ **Loading and error states**
- ✅ **Compact validation indicator** in selected value

## Basic Usage

```tsx
import { SiteComboBox } from "../Components/SiteComboBox";

// Basic site selection
const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

<SiteComboBox
  value={selectedSiteId}
  onChange={(siteId) => setSelectedSiteId(siteId)}
  placeholder="Choisir un site..."
/>;
```

## Advanced Usage

```tsx
// Filter by validation requirement
<SiteComboBox
  value={selectedSiteId}
  onChange={(siteId) => setSelectedSiteId(siteId)}
  filterByValidation={true} // Only show double validation sites
  placeholder="Sites avec double validation..."
/>

// Exclude specific sites
<SiteComboBox
  value={selectedSiteId}
  onChange={(siteId) => setSelectedSiteId(siteId)}
  excludeSiteIds={[1, 2, 3]} // Don't show these sites
  placeholder="Choisir un autre site..."
/>

// Custom styling and behavior
<SiteComboBox
  value={selectedSiteId}
  onChange={(siteId) => setSelectedSiteId(siteId)}
  isClearable={true}
  isDisabled={false}
  className="my-custom-class"
  inputId="site-selector"
  placeholder="Sélectionner un site..."
/>
```

## Props

| Prop                 | Type                                 | Default                | Description                                          |
| -------------------- | ------------------------------------ | ---------------------- | ---------------------------------------------------- |
| `value`              | `number \| null`                     | -                      | Selected site ID                                     |
| `onChange`           | `(selected: number \| null) => void` | -                      | Callback when selection changes                      |
| `placeholder`        | `string`                             | `"Choisir un site..."` | Placeholder text                                     |
| `inputId`            | `string`                             | -                      | HTML input ID                                        |
| `className`          | `string`                             | -                      | CSS class name                                       |
| `isDisabled`         | `boolean`                            | `false`                | Disable the component                                |
| `isClearable`        | `boolean`                            | `true`                 | Allow clearing selection                             |
| `excludeSiteIds`     | `number[]`                           | `[]`                   | Exclude these site IDs                               |
| `filterByValidation` | `boolean`                            | -                      | Show only sites with specific validation requirement |

## Validation Colors

- **Double Validation**: Yellow background (`#fef3c7`) with orange text (`#d97706`)
- **Simple Validation**: Green background (`#d1fae5`) with green text (`#059669`)

## Visual Features

### **Dropdown Options:**

```
┌─────────────────────────────────────┐
│ Site Alpha                    [DV]  │ ← Double Validation (Yellow)
│ Site Beta                     [SV]  │ ← Simple Validation (Green)
│ Site Gamma                    [DV]  │
└─────────────────────────────────────┘
```

### **Selected Value:**

```
┌─────────────────────────────────────┐
│ Site Alpha [DV]              [▼]    │ ← Compact indicator
└─────────────────────────────────────┘
```

## Data Source

The component automatically fetches sites from the backend using the `useGetSites` hook and handles:

- Loading states
- Error states
- Data transformation
- Site filtering based on props

## Comparison with UserComboBox

| Feature                    | UserComboBox   | SiteComboBox         |
| -------------------------- | -------------- | -------------------- |
| **Multi-select**           | ✅ Optional    | ❌ Single only       |
| **Role/Validation badges** | ✅ Role colors | ✅ Validation colors |
| **Filtering**              | By role        | By validation        |
| **Exclusion**              | By user IDs    | By site IDs          |
| **Search/Type**            | ✅ Yes         | ✅ Yes               |
| **Compact indicator**      | ❌ No          | ✅ Yes (DV/SV)       |

## Example Integration

```tsx
import React, { useState } from "react";
import { SiteComboBox } from "../Components/SiteComboBox";

function ConfigComponent() {
  const [selectedSite, setSelectedSite] = useState<number | null>(null);

  return (
    <div className="form-field">
      <label>Select Site</label>
      <SiteComboBox
        value={selectedSite}
        onChange={setSelectedSite}
        placeholder="Choose a site..."
        inputId="site-selection"
      />

      {selectedSite && <div>Selected site ID: {selectedSite}</div>}
    </div>
  );
}
```

## Integration in ConfigDialog

The SiteComboBox has replaced the SearchableCombobox in ConfigDialog, providing:

- **Better typing experience** (same as UserComboBox)
- **Visual validation indicators** in both dropdown and selected value
- **Consistent styling** with UserComboBox
- **Better error handling** and loading states
