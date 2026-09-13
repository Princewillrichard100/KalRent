import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
  userLat?: number | null;
  userLng?: number | null;
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
    location: "Ilorin",
    beds: "any",
    baths: "any",
    propertyType: "any",
    amenities: [],
    availableFrom: "any",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [4.5901, 8.4799],
    userLat: null,
    userLng: null,
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
