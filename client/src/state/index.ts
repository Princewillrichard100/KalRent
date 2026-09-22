import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  category?: string | null;
  locationValue?: string | null;
  guestCount?: number | string | null;
  roomCount?: number | string | null;
  bathroomCount?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
  userLat?: number | null;
  userLng?: number | null;
  lat?: number | null;
  lng?: number | null;
  sortBy?: string | null;
}

interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: "grid" | "list";
  hoveredPropertyId: number | null;
  selectedPropertyId: number | null;
}

export const initialState: InitialStateTypes = {
  filters: {
    location: "Anywhere in Nigeria",
    beds: "any",
    baths: "any",
    propertyType: "any",
    amenities: [],
    availableFrom: "any",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [8.6753, 9.0820],
    userLat: null,
    userLng: null,
    lat: null,
    lng: null,
    sortBy: null,
  },
  isFiltersFullOpen: false,
  viewMode: "grid",
  hoveredPropertyId: null,
  selectedPropertyId: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number }>
    ) => {
      state.filters.userLat = action.payload.lat;
      state.filters.userLng = action.payload.lng;
      state.filters.coordinates = [action.payload.lng, action.payload.lat];
      state.filters.location = "My Current Location";
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setHoveredPropertyId: (state, action: PayloadAction<number | null>) => {
      state.hoveredPropertyId = action.payload;
    },
    setSelectedPropertyId: (state, action: PayloadAction<number | null>) => {
      state.selectedPropertyId = action.payload;
    },
  },
});

export const {
  setFilters,
  setUserLocation,
  toggleFiltersFullOpen,
  setViewMode,
  setHoveredPropertyId,
  setSelectedPropertyId,
} = globalSlice.actions;

export default globalSlice.reducer;
