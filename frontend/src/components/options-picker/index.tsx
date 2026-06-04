import type * as React from 'react';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OptionsPickerProps {
  label: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

export const OptionsPicker = ({
  label,
  isSelected = false,
  onClick,
  className,
}: OptionsPickerProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        badgeVariants({ variant: isSelected ? 'default' : 'outline' }),
        'h-7 border-none rounded-full px-3 text-xs transition-colors',
        isSelected
          ? 'bg-accent-foreground text-primary-foreground hover:bg-accent-foreground/90'
          : 'bg-muted text-accent-foreground hover:bg-muted',
        className
      )}
    >
      {label}
    </button>
  );
};
