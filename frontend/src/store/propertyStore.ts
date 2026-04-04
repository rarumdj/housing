import { create } from 'zustand';

interface SearchFilters {
  state?: string;
  lga?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  isFurnished?: boolean;
  hasGenerator?: boolean;
  hasSecurity?: boolean;
  hasParking?: boolean;
  has3DTour?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

interface PropertyStore {
  filters: SearchFilters;
  setFilters: (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  viewMode: 'grid' | 'map';
  setViewMode: (m: 'grid' | 'map') => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  filters: {},
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: {} }),
  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),
}));
