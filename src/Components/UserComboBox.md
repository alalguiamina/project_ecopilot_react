# UserComboBox Component Documentation

## Overview

A reusable, modern combo box component for selecting users from the database with role-based styling and filtering capabilities. **Defaults to multi-select mode** and shows only admin, user, and superuser roles.

## Features

- ✅ **Fetches users directly from database** using `useGetUsers` hook
- ✅ **Multi-select by default** with role-based color coding
- ✅ **Filtered by role** - shows only admin, user, and superuser (excludes agents by default)
- ✅ **Role filtering** (show only specific roles)
- ✅ **User exclusion** (exclude specific user IDs)
- ✅ **Smart name display** (handles missing first/last names)
- ✅ **Loading and error states**

## Basic Usage

```tsx
import { UserComboBox } from "../Components/UserComboBox";

// Single user selection
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

<UserComboBox
  value={selectedUserId}
  onChange={(userId) => setSelectedUserId(userId as number | null)}
  placeholder="Select a user..."
/>;

// Multiple user selection
const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

<UserComboBox
  isMulti
  value={selectedUserIds}
  onChange={(userIds) => setSelectedUserIds(userIds as number[])}
  placeholder="Select users..."
/>;
```

## Advanced Usage

```tsx
// Show only administrators (override default role filter)
<UserComboBox
  value={selectedUserIds}
  onChange={(userIds) => setSelectedUserIds(userIds as number[])}
  filterByRole={["admin", "superuser"]} // Only show admins and superusers
  placeholder="Select administrators..."
/>

// Include agents (override default to show all roles)
<UserComboBox
  value={selectedUserIds}
  onChange={(userIds) => setSelectedUserIds(userIds as number[])}
  filterByRole={["admin", "user", "superuser", "agent"]} // Show all roles
  placeholder="Select any user including agents..."
/>

// Exclude specific users (e.g., current user)
<UserComboBox
  value={selectedUserIds}
  onChange={(userIds) => setSelectedUserIds(userIds as number[])}
  excludeUserIds={[currentUser.id]} // Don't show current user
  placeholder="Select other users..."
/>

// Custom styling and behavior
<UserComboBox
  value={selectedUserIds}
  onChange={(userIds) => setSelectedUserIds(userIds as number[])}
  closeMenuOnSelect={false} // Keep menu open for multi-select
  isClearable={true}
  isDisabled={false}
  className="my-custom-class"
  inputId="user-selector"
/>
```

## Props

| Prop                | Type                                             | Default                              | Description                      |
| ------------------- | ------------------------------------------------ | ------------------------------------ | -------------------------------- |
| `isMulti`           | `boolean`                                        | `false`                              | Enable multi-user selection      |
| `value`             | `number \| number[] \| null`                     | -                                    | Selected user ID(s)              |
| `onChange`          | `(selected: number \| number[] \| null) => void` | -                                    | Callback when selection changes  |
| `placeholder`       | `string`                                         | `"Sélectionner des utilisateurs..."` | Placeholder text                 |
| `inputId`           | `string`                                         | -                                    | HTML input ID                    |
| `className`         | `string`                                         | -                                    | CSS class name                   |
| `isDisabled`        | `boolean`                                        | `false`                              | Disable the component            |
| `isClearable`       | `boolean`                                        | `true`                               | Allow clearing selection         |
| `closeMenuOnSelect` | `boolean`                                        | `!isMulti`                           | Close menu after selection       |
| `filterByRole`      | `string[]`                                       | -                                    | Show only users with these roles |
| `excludeUserIds`    | `number[]`                                       | `[]`                                 | Exclude these user IDs           |

## Role Colors

- **Admin**: Red background (`#fee2e2`)
- **Super User**: Purple background (`#f3e8ff`)
- **Agent de saisie**: Green background (`#dcfce7`)
- **User**: Blue background (`#dbeafe`)
- **Default**: Gray background (`#e2e8f0`)

## Data Source

The component automatically fetches users from the backend using the `useGetUsers` hook and handles:

- Loading states
- Error states
- Data transformation (backend user format → UI user format)
- Role mapping (backend roles → UI role labels)

## Example Integration

```tsx
import React, { useState } from "react";
import { UserComboBox } from "../Components/UserComboBox";

function MyComponent() {
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);

  return (
    <div className="form-field">
      <label>Assign Users</label>
      <UserComboBox
        isMulti
        value={assignedUsers}
        onChange={(userIds) => setAssignedUsers(userIds as number[])}
        filterByRole={["agent", "user"]} // Only show agents and users
        placeholder="Select users to assign..."
      />

      <div>Selected users: {assignedUsers.length}</div>
    </div>
  );
}
```
