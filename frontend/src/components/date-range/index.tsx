import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange as DateRangeType } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeProps {
  mode?: 'single' | 'range' | 'multiple';
  numberOfMonths?: number;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  value?: Date | DateRangeType | undefined;
  onChange?: (date: Date | DateRangeType | undefined) => void;
  disabled?: boolean;
  captionLayout?: 'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years';
  fromDate?: Date;
  toDate?: Date;
  label?: string;
  minDate?: Date;
}

const DateRange: React.FC<DateRangeProps> = ({
  mode = 'single',
  numberOfMonths = 1,
  placeholder = 'Select date',
  className,
  buttonClassName,
  value,
  onChange,
  disabled = false,
  captionLayout = 'dropdown',
  fromDate,
  toDate,
  label,
  minDate,
}) => {
  const buttonId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<
    Date | DateRangeType | undefined
  >(value);

  // Update internal state when external value changes
  React.useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const handleDateSelect = (selectedDate: Date | DateRangeType | undefined) => {
    setInternalDate(selectedDate);
    onChange?.(selectedDate);

    // Close popover for single mode, keep open for range mode
    if (mode === 'single') {
      setOpen(false);
    }
  };

  const normalizedMinDate = React.useMemo(() => {
    if (!minDate) return undefined;
    const date = new Date(minDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [minDate]);

  const getDisplayText = () => {
    if (!internalDate) return placeholder;

    if (mode === 'range' && typeof internalDate === 'object' && 'from' in internalDate) {
      const range = internalDate as DateRangeType;
      if (range.from && range.to) {
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
      } else if (range.from) {
        return `${range.from.toLocaleDateString()} - ...`;
      }
    }

    if (internalDate instanceof Date) {
      return internalDate.toLocaleDateString();
    }

    return placeholder;
  };

  const calendarProps = {
    mode,
    selected: internalDate,
    captionLayout,
    onSelect: handleDateSelect,
    numberOfMonths,
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
    ...(normalizedMinDate && {
      disabled: { before: normalizedMinDate },
    }),
  } as unknown as React.ComponentProps<typeof Calendar>;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={buttonId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={buttonId}
          type="button"
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'w-full max-w-xs flex items-center !font-normal border-border',
            buttonClassName
          )}
        >
          <div className="flex-1 text-center mr-2">{getDisplayText()}</div>
          <CalendarIcon className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar {...calendarProps} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRange;
