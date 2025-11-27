export type UserRole = "admin" | "agent" | "user" | "superuser";

export interface User {
  id: number;
  username: string;
  role: string;
  sites: number[];
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  sites: number[];
}

export interface UpdateUserRequest {
  username: string;
  role: string;
  sites: number[];
  email?: string;
  first_name?: string;
  last_name?: string;
}

export type PartialUpdateUserRequest = Partial<UpdateUserRequest>;

export interface ApiError {
  detail: string;
}

export interface ValidationError {
  [key: string]: string[];
}

export interface DeleteUserResponse {
  detail: string;
}
