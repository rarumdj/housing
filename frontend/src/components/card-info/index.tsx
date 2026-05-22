import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface CardInfoProps {
  icon?: LucideIcon;
  iconClass?: string;
  label: string;
  value: ReactNode;
  suffix?: string;
  className?: string;
  hideIcon?: boolean;
}

export function CardInfo({
  icon: Icon,
  iconClass,
  label,
  value,
  suffix,
  className,
  hideIcon = true,
}: CardInfoProps) {
  return (
    <div className={cn('flex items-center gap-4 px-6 py-5', className)}>
      {!hideIcon && (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            iconClass
          )}
        >
          {Icon && <Icon className="size-5" />}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-accent-foreground">{label}</p>
        <p className="text-sm font-semibold text-accent-foreground">
          {value}
          {suffix && <span className="font-normal text-muted-foreground"> {suffix}</span>}
        </p>
      </div>
    </div>
  );
}
