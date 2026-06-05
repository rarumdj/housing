import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export interface SearchSelectOption {
  value: string;
  label: string;
  flag?: string;
}

interface SearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Allow entering a custom value that is not in the options list. */
  allowCustom?: boolean;
}

export const SearchSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  required,
  disabled,
  allowCustom = false,
}: SearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? (value || placeholder);

  const trimmedQuery = query.trim();

  const filtered = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [trimmedQuery, options]);

  const showCustomOption =
    allowCustom &&
    trimmedQuery.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-1.5">
      {label ? (
        <FieldLabel>
          {label} {required ? <span className="text-destructive">*</span> : null}
        </FieldLabel>
      ) : null}
      <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(''); }}>
        <PopoverTrigger
          type="button"
          disabled={disabled || (options.length === 0 && !allowCustom)}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-sm shadow-xs transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <span className={cn('flex min-w-0 items-center gap-2 truncate', !selected && !value && 'text-muted-foreground')}>
            {selected?.flag ? <span className="text-base leading-none">{selected.flag}</span> : null}
            <span className="truncate">{displayLabel}</span>
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="z-[200] w-[min(360px,calc(100vw-2rem))] overflow-hidden p-0">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 rounded-full border-border bg-muted/50 pl-9 text-sm"
              />
            </div>
          </div>
          <ul className="max-h-[280px] overflow-y-auto overscroll-contain p-1" role="listbox">
            {showCustomOption ? (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => select(trimmedQuery)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/80"
                >
                  <Plus className="size-4 shrink-0 text-primary" />
                  <span className="flex-1 truncate">Use “{trimmedQuery}”</span>
                </button>
              </li>
            ) : null}
            {filtered.length === 0 && !showCustomOption ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No results.</li>
            ) : (
              filtered.map((o) => {
                const isSelected = o.value === value;
                return (
                  <li key={o.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => select(o.value)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted/80',
                      )}
                    >
                      {o.flag ? <span className="text-base leading-none">{o.flag}</span> : null}
                      <span className="flex-1 truncate">{o.label}</span>
                      {isSelected ? <Check className="size-4 shrink-0 text-primary" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
