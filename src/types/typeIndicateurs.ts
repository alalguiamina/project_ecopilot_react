export interface TypeIndicateur {
  id: number;
  code: string;
  libelle: string;
  unite_default: string;
  poste: {
    id: number;
    name: string;
  };
}

export interface TypeIndicateursErrorResponse {
  detail?: string;
  non_field_errors?: string[];
}
