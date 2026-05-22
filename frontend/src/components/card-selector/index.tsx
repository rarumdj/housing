import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export interface CardSelectorOption {
  id: string;
  icon: string | React.ReactNode;
  title: string;
  description: string;
  tooltip?: string;
}

export interface CardSelectorProps {
  option: CardSelectorOption;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export function CardSelector({
  option,
  selected,
  onSelect,
  className,
}: CardSelectorProps) {
  const iconContent =
    typeof option.icon === 'string' ? (
      <img src={option.icon} alt={option.title} className="size-12 shrink-0" />
    ) : (
      option.icon
    );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border px-4 py-6 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary bg-muted/10',
        className
      )}
    >
      {iconContent}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-medium text-accent-foreground">{option.title}</h3>
          {option.tooltip ? (
            <Tooltip>
              <TooltipTrigger
                aria-label={`${option.title} info`}
                className="inline-flex items-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none"
              >
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-xs leading-relaxed">
                {option.tooltip}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
      </div>
    </button>
  );
}
