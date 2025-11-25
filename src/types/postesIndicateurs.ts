export interface PosteInfo {
  id: number;
  name: string;
}

export interface PosteIndicateur {
  id: number;
  poste: PosteInfo;
  code: string;
  libelle: string;
  unite_default: string;
}

export interface PosteIndicateursErrorResponse {
  detail?: string;
  non_field_errors?: string[];
}
