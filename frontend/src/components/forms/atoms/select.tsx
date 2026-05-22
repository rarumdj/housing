import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buttonVariants } from '@/components/ui/button';
import { inputVariants } from './variants';
import type { VariantProps } from 'class-variance-authority';

export interface SelectOption {
  value: string;
  label: React.ReactNode; // visual
  searchLabel: string; // searchable text
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  size?: VariantProps<typeof inputVariants>['size'];
  className?: string;
  id?: string;
  popoverClassName?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  onSearch?: (term: string) => void;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  searchable = false,
  disabled = false,
  size = 'default',
  className,
  id,
  popoverClassName,
  'aria-invalid': ariaInvalid,
  onSearch,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [_width, setWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (open && triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger
        ref={triggerRef as any}
        type="button"
        disabled={disabled}
        id={id}
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          inputVariants({ size }),
          'w-full justify-between text-left font-normal bg-transparent px-3 py-2',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-[3px]',
          !selectedOption && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="size-5 shrink-0" />}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className={cn('min-w-(--anchor-width) p-0', popoverClassName)}
        align="start"
      >
        <Command shouldFilter={!onSearch}>
          {searchable && (
            <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          )}
          <CommandList>
            <ScrollArea className={cn('max-h-72', !searchable && 'h-auto')}>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.searchLabel}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {option.icon && <option.icon className="size-5 shrink-0" />}
                      {option.label}
                    </div>
                    <Check
                      className={cn(
                        'ml-auto size-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
