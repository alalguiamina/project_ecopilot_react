// src/types/organisation.ts

export interface Site {
  id: number;
  name: string;
  location: string;
  surface: string;
}
export interface SiteGroup {
  id?: number;
  name: string;
  description: string;
  type: "Interne" | "Externe";
  siteId: number | "";
  members: number[];
}

export interface UserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string;
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
  // allow site to be number (id) or string (name) in UI; include optional sites array to match backend payload
  site?: number | string;
  sites?: Array<number | string>;
  role: string;
}
