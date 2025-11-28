export interface SaisieValeur {
  type_indicateur: number;
  valeur: number;
  unite: string;
}

export interface CreateSaisieRequest {
  site: number;
  mois: number;
  annee: number;
  valeurs: SaisieValeur[];
}

export interface Saisie {
  id: number;
  site: number;
  mois: number;
  annee: number;
  statut: string;
  require_double_validation: boolean;
  created_by: number;
  date_creation: string;
  first_validation_by: number | null;
  first_validation_date: string | null;
  final_validation_by: number | null;
  final_validation_date: string | null;
  valeurs: Array<{
    id: number;
    type_indicateur: number;
    valeur: number;
    unite: string;
  }>;
}

export interface UpdateSaisieRequest {
  mois?: number;
  annee?: number;
  valeurs?: SaisieValeur[];
}

export interface SaisieErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}

// CSV Upload types
export interface CsvUploadResponse {
  message: string;
  created_saisies?: number;
  updated_saisies?: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  warnings?: Array<{
    row: number;
    message: string;
  }>;
}

export interface CsvUploadRequest {
  siteId: number;
  file: File;
}
