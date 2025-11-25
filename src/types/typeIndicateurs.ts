export interface TypeIndicateur {
  id: number;
  name: string;
  description: string;
}

export interface TypeIndicateursErrorResponse {
  detail?: string;
  non_field_errors?: string[];
}
