import { cn } from '@/lib/utils';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const StepIndicator = ({
  currentStep,
  totalSteps,
  className,
}: StepIndicatorProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </p>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }, (_, i) => ({
          index: i,
          id: `step-segment-${i + 1}`,
        })).map(({ index: i, id }) => (
          <div
            key={id}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              i + 1 <= currentStep
                ? 'bg-foreground'
                : 'bg-foreground/20 dark:bg-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
};
