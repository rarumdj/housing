import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SummaryStatCardProps {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  iconWrapperClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  valueFirst?: boolean;
}

export const SummaryStatCard = ({
  icon,
  label,
  value,
  tooltip,
  isLoading = false,
  className,
  contentClassName,
  iconWrapperClassName,
  labelClassName,
  valueClassName,
  valueFirst = false,
}: SummaryStatCardProps) => {
  if (isLoading) {
    return (
      <Card
        className={cn(
          'ring-accent-foreground/10 p-0 from-accent-foreground/5 bg-linear-to-t text-card-foreground border-border',
          className
        )}
      >
        <CardContent className={cn('flex flex-col gap-2 p-4', contentClassName)}>
          <Skeleton
            className={cn('size-9 shrink-0 rounded-md', iconWrapperClassName)}
            aria-hidden
          />
          {valueFirst ? (
            <div className="mt-2 flex flex-col gap-2">
              <Skeleton className={cn('h-8 w-28', valueClassName)} />
              <Skeleton className={cn('h-4 w-40', labelClassName)} />
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className={cn('h-4 w-36', labelClassName)} />
                {tooltip ? <Skeleton className="size-3.5 rounded-sm" /> : null}
              </div>
              <Skeleton className={cn('h-6 w-24', valueClassName)} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'ring-accent-foreground/10 p-0 from-accent-foreground/5 bg-linear-to-t text-card-foreground border-border',
        className
      )}
    >
      <CardContent className={cn('flex flex-col gap-2 p-4', contentClassName)}>
        <Avatar
          size="sm"
          className={cn(
            'rounded-md after:rounded-md after:border-brand-200',
            iconWrapperClassName
          )}
        >
          <AvatarFallback className="rounded-md bg-brand-100 text-primary">
            {icon}
          </AvatarFallback>
        </Avatar>
        <div className="mt-8 flex items-center gap-1.5">
          {!valueFirst ? (
            <p className={cn('text-sm text-muted-foreground', labelClassName)}>{label}</p>
          ) : null}
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger
                aria-label={`${label} info`}
                className="inline-flex items-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none"
              >
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-xs leading-relaxed">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        {valueFirst ? (
          <>
            <p
              className={cn(
                'text-lg font-semibold text-accent-foreground',
                valueClassName
              )}
            >
              {value}
            </p>
            <p className={cn('text-sm text-muted-foreground', labelClassName)}>{label}</p>
          </>
        ) : (
          <p
            className={cn('text-lg font-semibold text-accent-foreground', valueClassName)}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
