import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type InfoHoverCardItem = {
  icon: LucideIcon;
  text: string;
};

type InfoHoverCardProps = {
  title: string;
  description: string;
  items: InfoHoverCardItem[];
  ariaLabel: string;
  trigger?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function InfoHoverCard({
  title,
  description,
  items,
  ariaLabel,
  trigger,
  className,
  contentClassName,
}: InfoHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            className={cn(
              'text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded-full transition-colors',
              className
            )}
            aria-label={ariaLabel}
          />
        }
      >
        {trigger ?? <Info className="size-4" />}
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={10}
        className={cn('w-sm rounded-2xl p-0', contentClassName)}
      >
        <div className="space-y-4">
          <div className="space-y-1 border-b border-border px-4 py-3">
            <h4 className="text-sm font-semibold text-accent-foreground">{title}</h4>
          </div>
          <p className="text-muted-foreground text-xs leading-5 px-4">{description}</p>

          <div className="space-y-3 px-4 pb-4">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.text} className="flex items-start gap-3">
                  <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <p className="text-muted-foreground text-xs leading-5">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
