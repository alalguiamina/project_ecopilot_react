// src/types/organisation.ts

export interface Site {
  id: number;
  name: string;
  location: string;
  surface: string;
}
export interface SiteGroup {
  id?: number;
  name: string; // Nom de l'unité
  description: string; // Description
  type: "Interne" | "Externe"; // Type
  siteId: number | ""; // Site selection
  members: number[]; // Membres (user IDs)
  validationLevel?: 0 | 1 | 2; // Niveau de validation
}

export interface UserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string; // Keep for backward compatibility with display
  sites?: number[]; // Add sites array for multi-site support
  password?: string;
  role: string;
}
export interface NewUser {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // allow site to be number (id) or string (name) in UI; sites array should be numbers for backend compatibility
  site?: number | string;
  sites?: number[];
  role: string;
}
