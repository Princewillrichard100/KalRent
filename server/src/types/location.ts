export interface AutocompleteTerm {
  offset: number;
  value: string;
}

export interface LocationSuggestion {
  id: string;
  place_id: string;
  display_name: string;
  secondary_text?: string;
  types: string[];
  terms: AutocompleteTerm[];
  query: string;
  lat?: number;
  lng?: number;
}

export interface AutocompleteResponse {
  autocomplete_terms: LocationSuggestion[];
}

export interface LocationDetailsResponse {
  place_id: string;
  display_name: string;
  lat: number;
  lng: number;
  viewport?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  city?: string;
  state?: string;
  country?: string;
}
