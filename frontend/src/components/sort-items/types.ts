import type { FilterOption } from '@/components/filters/types';

export interface SortOption {
  title: string;
  sortKey: string;
}

export interface SortItemsProps {
  onSort?: () => void;
  onFilter?: () => void;
  onSearchChange?: (value: string) => void;
  onSortChange?: (params: Record<string, string>) => void;
  onFilterChange?: (params: Record<string, string>) => void;
  onExport?: () => void;
  className?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  selectedSort?: string;
  selectedSortDirection?: 'asc' | 'desc';
  activeSortCount?: number;
  filterConfig?: FilterOption[];
  activeFilterCount?: number;
  exportLoading?: boolean;
  exportDisabled?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  datePresets?: { label: string; value: string }[];
}
