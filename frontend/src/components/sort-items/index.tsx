import {
  RiExpandUpDownLine,
  RiExportLine,
  RiEqualizer3Line,
  RiSearch2Line,
} from '@remixicon/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { buttonVariants } from '@/components/ui/button';
import Filters from '../filters';
import { CustomButton } from '../button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { StatusType } from '../filters/configs';
import type { SortItemsProps } from './types';

function toParamKey(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join('');
}

const SortItems = ({
  onSort,
  onFilter,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onExport,
  className,
  searchValue = '',
  searchPlaceholder = 'Search',
  sortOptions,
  selectedSort = '',
  selectedSortDirection,
  activeSortCount,
  filterConfig,
  activeFilterCount = 0,
  exportLoading = false,
  exportDisabled = false,
  showSearch = true,
  showSort = true,
  showFilter = true,
  showExport = true,
  datePresets,
}: SortItemsProps) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortSearch, setSortSearch] = useState('');

  const handleExport = () => {
    onExport?.();
  };

  const handleSortChange = (sortKey: string, direction: 'asc' | 'desc') => {
    if (selectedSort === sortKey && selectedSortDirection === direction) {
      onSortChange?.({});
      setSortOpen(false);
      return;
    }

    onSortChange?.({ [`sort_${sortKey}`]: direction });
    setSortOpen(false);
  };

  const handleClearSort = () => {
    onSortChange?.({});
    setSortOpen(false);
  };

  const visibleSortOptions = (sortOptions ?? []).filter((option) =>
    option.title.toLowerCase().includes(sortSearch.trim().toLowerCase())
  );

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    const prefixedFilters = Object.entries(filters).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (value == null || value === '') return acc;
        acc[`filter_${toParamKey(key)}`] = String(value);
        return acc;
      },
      {}
    );

    onFilterChange?.(prefixedFilters);
    onFilter?.();
  };

  const sortTriggerClass = cn(
    buttonVariants({ variant: 'outline', size: 'default' }),
    'rounded-lg text-muted-foreground'
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 animate-reveal-soft reveal-delay-1',
        className
      )}
    >
      {showSearch && (
        <div className="relative flex min-w-[320px]">
          <RiSearch2Line className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="pl-9 pr-9 bg-background border-border placeholder:text-xs"
          />
        </div>
      )}

      {showSort &&
        (sortOptions ? (
          <Popover open={sortOpen} onOpenChange={setSortOpen} modal>
            <PopoverTrigger type="button" className={sortTriggerClass}>
              <span className="inline-flex items-center gap-2">
                Sort
                {!!(activeSortCount ?? (selectedSort ? 1 : 0)) && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-accent-foreground">
                    {activeSortCount ?? 1}
                  </span>
                )}
                <RiExpandUpDownLine className="size-4" />
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-64 gap-0 p-0" align="start">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-semibold text-accent-foreground">Sort</span>
                {!!(activeSortCount ?? (selectedSort ? 1 : 0)) && (
                  <button
                    type="button"
                    onClick={handleClearSort}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span>Clear</span>
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <Command>
                <CommandInput
                  placeholder="Search sort options..."
                  value={sortSearch}
                  onValueChange={setSortSearch}
                />
                <CommandList>
                  {visibleSortOptions.length === 0 ? (
                    <CommandEmpty>No sort options found.</CommandEmpty>
                  ) : (
                    <div className="px-4 py-2">
                      {visibleSortOptions.map((option) => (
                        <div key={option.sortKey} className="space-y-2 py-2">
                          <div className="text-sm font-medium text-accent-foreground">
                            {option.title}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSortChange(option.sortKey, 'asc')}
                              className={cn(
                                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                                selectedSort === option.sortKey &&
                                  selectedSortDirection === 'asc'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              Asc
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSortChange(option.sortKey, 'desc')}
                              className={cn(
                                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                                selectedSort === option.sortKey &&
                                  selectedSortDirection === 'desc'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              Desc
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <CustomButton
            variant="outline"
            size="default"
            className="rounded-lg text-muted-foreground!"
            iconPlacement="right"
            icon={<RiExpandUpDownLine className="size-4" />}
            onClick={() => onSort?.()}
          >
            Sort
          </CustomButton>
        ))}
      {showFilter && (
        <Filters
          config={filterConfig ?? StatusType}
          datePresets={datePresets}
          trigger={
            <span className="inline-flex items-center gap-2">
              Filter
              {!!activeFilterCount && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-accent-foreground">
                  {activeFilterCount}
                </span>
              )}
              <RiEqualizer3Line className="size-4" />
            </span>
          }
          triggerClassName={sortTriggerClass}
          onFiltersChange={handleFiltersChange}
        />
      )}
      {showExport && (
        <CustomButton
          size="default"
          variant="outline"
          className="rounded-lg bg-muted text-accent-foreground hover:bg-muted/80"
          iconPlacement="right"
          icon={<RiExportLine className="size-4" />}
          onClick={handleExport}
          loading={exportLoading}
          disabled={exportLoading || exportDisabled}
        >
          Export
        </CustomButton>
      )}
    </div>
  );
};

export default SortItems;
