import * as React from 'react';
import { Filter, X } from 'lucide-react';
import type { DateRange as DateRangeType } from 'react-day-picker';
import DateRange from '@/components/date-range';
import { Select, type SelectOption } from '@/components/forms/atoms/select';
import { OptionsPicker } from '@/components/options-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { FilterOption, FiltersProps, Operators } from './types';

type OperatorState = {
  fromOp: Extract<Operators, 'gte' | 'gt'> | null;
  fromVal: string;
  toOp: Extract<Operators, 'lte' | 'lt'> | null;
  toVal: string;
};

type RangeState = {
  min: string;
  max: string;
};

type FilterValue =
  | string
  | string[]
  | Date
  | DateRangeType
  | null
  | undefined
  | OperatorState
  | RangeState;

const DEFAULT_OPERATOR_STATE: OperatorState = {
  fromOp: null,
  fromVal: '',
  toOp: null,
  toVal: '',
};

const DEFAULT_RANGE_STATE: RangeState = {
  min: '',
  max: '',
};

function isOperatorState(value: FilterValue): value is OperatorState {
  return Boolean(value && typeof value === 'object' && 'fromOp' in value);
}

function isRangeState(value: FilterValue): value is RangeState {
  return Boolean(value && typeof value === 'object' && 'min' in value && 'max' in value);
}

function toSelectOptions(option: FilterOption): SelectOption[] {
  return (option.list ?? []).map((item) => ({
    value: item.value,
    label: item.label,
    searchLabel: `${item.label} ${item.subLabel ?? ''}`.trim(),
  }));
}

function formatDateParam(value: Date) {
  return value.toISOString().split('T')[0];
}

const DEFAULT_DATE_PRESETS = [
  { value: 'last7Days', label: 'Last 7 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'lastYear', label: 'Last Year' },
] as const;

const Filters: React.FC<FiltersProps> = ({
  config,
  onFiltersChange,
  trigger,
  triggerClassName,
  className,
  datePresets = DEFAULT_DATE_PRESETS,
}) => {
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<Record<string, FilterValue>>({});
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>(
    {}
  );

  const validateOperatorState = (
    dataType: 'date' | 'number',
    state: { fromVal: string; toVal: string }
  ): string | null => {
    const from = state.fromVal?.trim();
    const to = state.toVal?.trim();
    if (!from || !to) return null;

    if (dataType === 'date') {
      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime();
      if (Number.isNaN(fromDate) || Number.isNaN(toDate)) return null;
      if (toDate < fromDate) {
        return 'To date must be greater than or equal to From date.';
      }
      return null;
    }

    const fromNum = Number(from);
    const toNum = Number(to);
    if (Number.isNaN(fromNum) || Number.isNaN(toNum)) return null;
    if (toNum < fromNum) {
      return 'To value must be greater than or equal to From value.';
    }
    return null;
  };

  const validateRangeState = (
    dataType: 'number' | 'text',
    state: { min: string; max: string }
  ): string | null => {
    const min = state.min?.trim();
    const max = state.max?.trim();
    if (!min || !max) return null;

    if (dataType === 'number') {
      const minNum = Number(min);
      const maxNum = Number(max);
      if (Number.isNaN(minNum) || Number.isNaN(maxNum)) return null;
      if (maxNum < minNum) {
        return 'Max must be greater than or equal to Min.';
      }
      return null;
    }

    const minNum = Number(min);
    const maxNum = Number(max);
    if (!Number.isNaN(minNum) && !Number.isNaN(maxNum) && maxNum < minNum) {
      return 'Max must be greater than or equal to Min.';
    }
    return null;
  };

  const getOperatorState = (key: string): OperatorState => {
    const value = filters[key];
    return isOperatorState(value) ? value : DEFAULT_OPERATOR_STATE;
  };

  const serializeOperator = (state: {
    fromVal: string;
    toVal: string;
  }): string | null => {
    const parts: string[] = [];
    if (state.fromVal?.trim()) {
      parts.push(`gte:${state.fromVal.trim()}`);
    }
    if (state.toVal?.trim()) {
      parts.push(`lte:${state.toVal.trim()}`);
    }
    return parts.length > 0 ? parts.join(',') : null;
  };

  const getRangeState = (key: string): RangeState => {
    const value = filters[key];
    return isRangeState(value) ? value : DEFAULT_RANGE_STATE;
  };

  const serializeRange = (state: { min: string; max: string }): string | null => {
    const min = state.min?.trim() ?? '';
    const max = state.max?.trim() ?? '';
    if (!min && !max) return null;
    return `${min},${max}`;
  };

  const serializeDateRange = (value: FilterValue): string | null => {
    if (!value) return null;

    if (value instanceof Date) {
      return formatDateParam(value);
    }

    if (typeof value === 'object' && 'from' in value) {
      const from = value.from ? formatDateParam(value.from) : '';
      const to = value.to ? formatDateParam(value.to) : '';

      if (!from && !to) return null;
      return `${from},${to}`;
    }

    return null;
  };

  const getDateRangeValue = (key: string): DateRangeType | undefined => {
    const value = filters[key];

    if (value && typeof value === 'object' && 'from' in value) {
      return value as DateRangeType;
    }

    if (value instanceof Date) {
      return { from: value, to: value };
    }

    return undefined;
  };

  const handleDateRangeEdgeChange = (
    key: string,
    edge: 'from' | 'to',
    nextValue: Date | undefined
  ) => {
    const current: DateRangeType = getDateRangeValue(key) ?? {
      from: undefined,
      to: undefined,
    };
    const nextRange: DateRangeType = {
      from: edge === 'from' ? nextValue : current.from,
      to: edge === 'to' ? nextValue : current.to,
    };

    handleFilterChange(key, nextRange);
  };

  const getDateRangeFromPreset = React.useCallback(
    (preset: string): DateRangeType | null => {
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const startOfLastMonth = new Date(
        endOfLastMonth.getFullYear(),
        endOfLastMonth.getMonth(),
        1
      );
      const presetMap: Record<string, DateRangeType> = {
        last7Days: {
          from: new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000),
          to: today,
        },
        thisMonth: {
          from: startOfThisMonth,
          to: today,
        },
        lastMonth: {
          from: startOfLastMonth,
          to: endOfLastMonth,
        },
        lastYear: {
          from: new Date(today.getFullYear() - 1, 0, 1),
          to: new Date(today.getFullYear() - 1, 11, 31),
        },
        '7days': {
          from: new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000),
          to: today,
        },
        '30days': {
          from: new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000),
          to: today,
        },
        '6months': {
          from: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
          to: today,
        },
        '1year': {
          from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          to: today,
        },
      };
      return presetMap[preset] || null;
    },
    []
  );

  React.useEffect(() => {
    const initialFilters: Record<string, FilterValue> = {};
    config.forEach((option) => {
      if (option.type === 'date' || option.type === 'dateRange') {
        const defaultPreset = option.defaultDatePreset ?? datePresets[0].value;
        initialFilters[`${option.key}_preset`] = defaultPreset;
        const dateRange = getDateRangeFromPreset(defaultPreset);
        if (dateRange) {
          initialFilters[option.key] = dateRange;
        }
      }
    });

    if (Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [config, getDateRangeFromPreset]);

  const handleFilterChange = (key: string, value: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSelectOption = (
    key: string,
    value: string,
    mode: 'single' | 'multiple' = 'single'
  ) => {
    if (mode === 'multiple') {
      const currentValues = Array.isArray(filters[key]) ? (filters[key] as string[]) : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value];
      handleFilterChange(key, newValues);
      return;
    }

    const currentValue = filters[key];
    const newValue = currentValue === value ? null : value;
    handleFilterChange(key, newValue);
  };

  const handleDatePreset = (key: string, preset: string) => {
    const currentPreset = filters[`${key}_preset`];
    const newPreset = currentPreset === preset ? null : preset;

    if (newPreset) {
      handleFilterChange(`${key}_preset`, newPreset);
      const dateRange = getDateRangeFromPreset(newPreset);
      if (dateRange) {
        handleFilterChange(key, dateRange);
      }
      return;
    }

    handleFilterChange(`${key}_preset`, null);
    handleFilterChange(key, undefined);
  };

  const handleReset = () => {
    const resetFilters: Record<string, FilterValue> = {};
    config.forEach((option) => {
      if (option.type === 'multiselect' || option.type === 'choice') {
        resetFilters[option.key] = [];
      } else if (option.type === 'date' || option.type === 'dateRange') {
        resetFilters[option.key] = undefined;
        resetFilters[`${option.key}_preset`] = null;
      } else if (option.type === 'operator') {
        resetFilters[option.key] = DEFAULT_OPERATOR_STATE;
      } else if (option.type === 'range' || option.type === 'numberRange') {
        resetFilters[option.key] = DEFAULT_RANGE_STATE;
      } else {
        resetFilters[option.key] = null;
      }
    });
    setFilters(resetFilters);
    onFiltersChange({});
  };

  const handleApply = () => {
    const configByKey = Object.fromEntries(config.map((item) => [item.key, item]));
    const errors: Record<string, string> = {};

    config.forEach((option) => {
      if (option.type === 'operator') {
        const state = getOperatorState(option.key);
        const err = validateOperatorState(option.dataType ?? 'date', {
          fromVal: state.fromVal,
          toVal: state.toVal,
        });
        if (err) errors[option.key] = err;
      } else if (option.type === 'range' || option.type === 'numberRange') {
        const state = getRangeState(option.key);
        const rangeDataType =
          option.dataType === 'date' ? 'number' : (option.dataType ?? 'number');
        const err = validateRangeState(rangeDataType as 'number' | 'text', state);
        if (err) errors[option.key] = err;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const filteredFilters = Object.entries(filters).reduce<Record<string, FilterValue>>(
      (acc, [key, value]) => {
        const option = configByKey[key];
        if (option?.type === 'operator') {
          const serialized = serializeOperator(getOperatorState(key));
          if (serialized) acc[key] = serialized;
          return acc;
        }

        if (option?.type === 'range' || option?.type === 'numberRange') {
          const serialized = serializeRange(getRangeState(key));
          if (serialized) acc[key] = serialized;
          return acc;
        }

        if (option?.type === 'date' || option?.type === 'dateRange') {
          const serialized = serializeDateRange(value);
          if (serialized) acc[key] = serialized;
          return acc;
        }

        if (option?.type === 'choice' || option?.type === 'multiselect') {
          if (Array.isArray(value) && value.length > 0) {
            acc[key] = value.join(',');
          }
          return acc;
        }

        if (
          ![null, undefined, ''].includes(value as string | null | undefined) &&
          !(Array.isArray(value) && !value.length) &&
          !isOperatorState(value) &&
          !isRangeState(value)
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    onFiltersChange(filteredFilters as Record<string, unknown>);
    setOpen(false);
  };

  const renderFilterOption = (option: FilterOption) => {
    switch (option.type) {
      case 'text': {
        const textValue = filters[option.key];
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <Input
              type="text"
              value={typeof textValue === 'string' ? textValue : ''}
              onChange={(event) => handleFilterChange(option.key, event.target.value)}
              placeholder={option.placeholder || `Enter ${option.title.toLowerCase()}`}
            />
          </div>
        );
      }

      case 'radio': {
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {option.list?.map((item) => (
                <OptionsPicker
                  key={item.value}
                  label={item.label}
                  isSelected={filters[option.key] === item.value}
                  onClick={() => handleSelectOption(option.key, item.value, 'single')}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'choice': {
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {option.list?.map((item) => (
                <OptionsPicker
                  key={item.value}
                  label={item.label}
                  isSelected={
                    Array.isArray(filters[option.key]) &&
                    (filters[option.key] as string[]).includes(item.value)
                  }
                  onClick={() => handleSelectOption(option.key, item.value, 'multiple')}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'select': {
        const selectMode = option.selectMode || 'single';
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {option.list?.map((item) => {
                const isSelected =
                  selectMode === 'multiple'
                    ? Array.isArray(filters[option.key]) &&
                      (filters[option.key] as string[]).includes(item.value)
                    : filters[option.key] === item.value;

                return (
                  <OptionsPicker
                    key={item.value}
                    label={item.label}
                    isSelected={isSelected}
                    onClick={() => handleSelectOption(option.key, item.value, selectMode)}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      case 'multiselect': {
        const selectMode = option.comboboxMode || 'multiple';
        const list = option.list ?? [];
        const selectedValue = filters[option.key];

        if (selectMode === 'single') {
          return (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-accent-foreground">
                {option.title}
              </h4>
              <Select
                options={toSelectOptions(option)}
                value={typeof selectedValue === 'string' ? selectedValue : ''}
                onChange={(value) => handleFilterChange(option.key, value)}
                placeholder={option.placeholder || `Select ${option.title.toLowerCase()}`}
                searchable
              />
            </div>
          );
        }

        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {list.map((item) => (
                <OptionsPicker
                  key={item.value}
                  label={item.label}
                  isSelected={
                    Array.isArray(filters[option.key]) &&
                    (filters[option.key] as string[]).includes(item.value)
                  }
                  onClick={() => handleSelectOption(option.key, item.value, 'multiple')}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'date': {
        const dateMode = option.dateMode || 'range';
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="space-y-3">
              <DateRange
                mode={dateMode}
                value={
                  filters[option.key] instanceof Date ||
                  (filters[option.key] &&
                    typeof filters[option.key] === 'object' &&
                    'from' in (filters[option.key] as object))
                    ? (filters[option.key] as Date | DateRangeType | undefined)
                    : undefined
                }
                onChange={(date) => handleFilterChange(option.key, date)}
                placeholder={
                  option.placeholder ||
                  `Select ${dateMode === 'range' ? 'date range' : 'date'}`
                }
                className="w-full"
                buttonClassName="max-w-none"
              />
              {(option.datePresets ?? datePresets).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(option.datePresets ?? datePresets).map((preset) => (
                    <OptionsPicker
                      key={preset.value}
                      label={preset.label}
                      isSelected={filters[`${option.key}_preset`] === preset.value}
                      onClick={() => handleDatePreset(option.key, preset.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'dateRange': {
        const rangeValue = getDateRangeValue(option.key);

        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="space-y-3">
              <div className="flex w-full flex-row gap-3">
                <div className="flex w-full flex-col gap-2">
                  <span className="text-xs text-muted-foreground">From</span>
                  <DateRange
                    mode="single"
                    value={rangeValue?.from}
                    onChange={(date) =>
                      handleDateRangeEdgeChange(
                        option.key,
                        'from',
                        date instanceof Date ? date : undefined
                      )
                    }
                    placeholder="Select from date"
                    className="w-full"
                    buttonClassName="max-w-none"
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <span className="text-xs text-muted-foreground">To</span>
                  <DateRange
                    mode="single"
                    value={rangeValue?.to}
                    onChange={(date) =>
                      handleDateRangeEdgeChange(
                        option.key,
                        'to',
                        date instanceof Date ? date : undefined
                      )
                    }
                    placeholder="Select to date"
                    className="w-full"
                    buttonClassName="max-w-none"
                    minDate={rangeValue?.from}
                  />
                </div>
              </div>
              {(option.datePresets ?? datePresets).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(option.datePresets ?? datePresets).map((preset) => (
                    <OptionsPicker
                      key={preset.value}
                      label={preset.label}
                      isSelected={filters[`${option.key}_preset`] === preset.value}
                      onClick={() => handleDatePreset(option.key, preset.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'numberRange':
      case 'range': {
        const dataType = option.dataType ?? 'number';
        const state = getRangeState(option.key);

        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex gap-2">
              <Input
                type={dataType === 'number' ? 'number' : 'text'}
                value={state.min}
                onChange={(event) =>
                  handleFilterChange(option.key, {
                    ...state,
                    min: event.target.value,
                  })
                }
                placeholder={option.placeholderMin ?? 'Min'}
                className={cn('flex-1')}
              />
              <Input
                type={dataType === 'number' ? 'number' : 'text'}
                value={state.max}
                onChange={(event) =>
                  handleFilterChange(option.key, {
                    ...state,
                    max: event.target.value,
                  })
                }
                placeholder={option.placeholderMax ?? 'Max'}
                className={cn('flex-1')}
              />
            </div>
            {validationErrors[option.key] && (
              <p className="mt-1 text-xs text-destructive">
                {validationErrors[option.key]}
              </p>
            )}
          </div>
        );
      }

      case 'operator': {
        const dataType = option.dataType ?? 'date';
        const state = getOperatorState(option.key);
        const fromInputId = `${option.key}-from`;
        const toInputId = `${option.key}-to`;

        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-accent-foreground">
              {option.title}
            </h4>
            <div className="flex w-full flex-row gap-3">
              <div className="flex w-full flex-col gap-2">
                <label htmlFor={fromInputId} className="text-xs text-muted-foreground">
                  From
                </label>
                <Input
                  id={fromInputId}
                  type={dataType === 'date' ? 'date' : 'number'}
                  value={state.fromVal}
                  onChange={(event) =>
                    handleFilterChange(option.key, {
                      ...state,
                      fromVal: event.target.value,
                    })
                  }
                  placeholder={
                    dataType === 'date'
                      ? (option.placeholderFrom ?? 'YYYY-MM-DD')
                      : (option.placeholderFrom ?? 'Min value')
                  }
                  className={cn('min-w-0 flex-1')}
                />
              </div>
              <div className="flex w-full flex-col gap-2">
                <label htmlFor={toInputId} className="text-xs text-muted-foreground">
                  To
                </label>
                <Input
                  id={toInputId}
                  type={dataType === 'date' ? 'date' : 'number'}
                  value={state.toVal}
                  onChange={(event) =>
                    handleFilterChange(option.key, {
                      ...state,
                      toVal: event.target.value,
                    })
                  }
                  placeholder={
                    dataType === 'date'
                      ? (option.placeholderTo ?? 'YYYY-MM-DD')
                      : (option.placeholderTo ?? 'Max value')
                  }
                  className={cn('min-w-0 flex-1')}
                />
              </div>
            </div>
            {validationErrors[option.key] && (
              <p className="mt-1 text-xs text-destructive">
                {validationErrors[option.key]}
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const defaultTriggerClass = cn(
    buttonVariants({ variant: 'outline', size: 'default' }),
    'items-center gap-2 rounded-lg border-border text-muted-foreground'
  );

  return (
    <div className={className}>
      <Popover data-testid="filters" open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger
          data-testid="filters-trigger"
          type="button"
          className={cn(defaultTriggerClass, triggerClassName)}
        >
          {trigger ?? (
            <>
              <Filter className="size-4" />
              Filter
            </>
          )}
        </PopoverTrigger>
        <PopoverContent
          data-testid="filters-content"
          className="min-w-[455px] gap-0 rounded-[14px] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-sm font-semibold text-accent-foreground">Filter</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-accent-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              className="max-h-[350px] overflow-y-auto p-4"
              onWheelCapture={(event: React.WheelEvent<HTMLDivElement>) => {
                if (typeof window !== 'undefined') {
                  window.scrollBy({ top: event.deltaY, behavior: 'auto' });
                }
              }}
            >
              {config.map((option) => (
                <div key={option.key} className="pb-6 last:pb-0">
                  {renderFilterOption(option)}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                className="rounded-full"
              >
                Clear all filters
              </Button>
              <Button type="button" onClick={handleApply} className="rounded-full px-4">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Filters;
