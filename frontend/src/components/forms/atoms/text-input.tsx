import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { forwardRef, useCallback, useRef } from 'react';
import { inputVariants, type InputProps } from './variants';

const temporalTypes = new Set(['date', 'datetime-local', 'time', 'month', 'week']);

const temporalChromeClasses =
  'pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-moz-calendar-picker-indicator]:pointer-events-none [&::-moz-calendar-picker-indicator]:opacity-0';

const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput(
  { className, size, type, disabled, ...props },
  ref
) {
  const innerRef = useRef<HTMLInputElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const isTemporal = type != null && temporalTypes.has(type);

  if (isTemporal) {
    const Icon = type === 'time' ? Clock : CalendarIcon;
    const pickerLabel =
      type === 'time'
        ? 'Open time picker'
        : type === 'month'
          ? 'Open month picker'
          : type === 'week'
            ? 'Open week picker'
            : 'Open date picker';

    return (
      <div className="relative w-full">
        <Input
          ref={setRefs}
          data-slot="input"
          disabled={disabled}
          type={type}
          className={cn(inputVariants({ size }), temporalChromeClasses, className)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={pickerLabel}
          className={cn(
            'text-muted-foreground hover:text-accent-foreground absolute top-1/2 right-2 z-10 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-transparent p-0 transition-colors',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
          onClick={(e) => {
            e.preventDefault();
            innerRef.current?.showPicker?.();
          }}
        >
          <Icon className="pointer-events-none size-4 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <Input
      ref={ref}
      data-slot="input"
      disabled={disabled}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';

export { TextInput };
