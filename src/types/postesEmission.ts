export interface PosteEmission {
  id: number;
  name: string;
}

export interface PostesEmissionErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}
