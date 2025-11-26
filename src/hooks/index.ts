// User API Hooks
export { useCreateUser } from "./useCreateUser";
export { useGetUser } from "./useGetUser";
export { useGetUsers } from "./useGetUsers";
export { useGetUsersBySite } from "./useGetUsersBySite";
export { useUpdateUser } from "./useUpdateUser";
export { usePartialUpdateUser } from "./usePartialUpdateUser";
export { useDeleteUser } from "./useDeleteUser";
export { useAuthToken } from "./useAuthToken";
export { useCreateSite } from "./useCreateSite";
export { useUpdateSite } from "./useUpdateSite";
export { useUpdateSiteConfig } from "./useUpdateSiteConfig";
export { useGetSites } from "./useGetSites";
export { useDeleteSite } from "./useDeleteSite";
export { useGetCurrentUser } from "./useGetCurrentUser";

// Other hooks
export { usePageTitle } from "./usePageTitle";

// Export types from user
export type {
  User,
  CreateUserRequest,
  PartialUpdateUserRequest,
  DeleteUserResponse,
  UserRole,
} from "../types/user";

// Export types from sites
export type {
  Site,
  CreateSiteRequest,
  UpdateSiteRequest,
  SiteConfigUpdate,
  SiteConfigItem,
} from "../types/site";

// Export types from typeIndicateurs
export type {
  TypeIndicateur,
  TypeIndicateursErrorResponse,
} from "../types/typeIndicateurs";
// Export types from postesEmission
export type {
  PosteEmission,
  PostesEmissionErrorResponse,
} from "../types/postesEmission";

// Export types from postesIndicateurs
export type {
  PosteIndicateur,
  PosteInfo,
  PosteIndicateursErrorResponse,
} from "../types/postesIndicateurs";
