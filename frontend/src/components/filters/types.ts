export type Operators = 'lte' | 'lt' | 'gte' | 'gt';

export type FilterType =
  | 'select'
  | 'dateRange'
  | 'text'
  | 'radio'
  | 'choice'
  | 'numberRange'
  | 'date'
  | 'multiselect'
  | 'operator'
  | 'range';

export interface FilterOption {
  type: FilterType;
  key: string;
  title: string;
  list?: Array<{
    value: string;
    label: string;
    subLabel?: string;
    icon?: string;
  }>;
  placeholder?: string;
  datePresets?: Array<{
    value: string;
    label: string;
  }>;
  selectMode?: 'single' | 'multiple';
  dateMode?: 'single' | 'range';
  comboboxMode?: 'single' | 'multiple';
  defaultDatePreset?: string;
  dataType?: 'date' | 'number';
  placeholderFrom?: string;
  placeholderTo?: string;
  placeholderMin?: string;
  placeholderMax?: string;
}

export type FilterConfig = FilterOption[];
export interface FiltersProps {
  config: FilterOption[];
  onFiltersChange: (filters: Record<string, any>) => void;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  className?: string;
  datePresets?: { value: string; label: string }[];
}
