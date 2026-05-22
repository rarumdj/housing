import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  id: number;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  activeStep: number;
  className?: string;
  onStepClick?: (stepId: number) => void;
}

export function Stepper({ steps, activeStep, className, onStepClick }: StepperProps) {
  return (
    <nav
      className={cn('flex flex-wrap items-center gap-1 text-sm', className)}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const isCompleted = step.id < activeStep;
        const isActive = step.id === activeStep;
        const isInactive = step.id > activeStep;
        const isClickable = Boolean(onStepClick && isCompleted);
        const StepContent = (
          <>
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border border-border text-xs font-medium transition-colors',
                isCompleted && 'border-primary bg-primary text-primary-foreground',
                isActive && 'border-primary bg-background text-foreground',
                isInactive && 'bg-background text-muted-foreground'
              )}
            >
              {isCompleted ? <Check className="size-4" strokeWidth={2} /> : step.id}
            </span>
            <span
              className={cn(
                'font-medium',
                isCompleted && 'text-accent-foreground',
                isActive && 'text-primary',
                isInactive && 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </>
        );

        return (
          <div key={step.id} className="flex items-center gap-2">
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
                aria-label={`Go back to ${step.label}`}
              >
                {StepContent}
              </button>
            ) : (
              <div
                aria-current={isActive ? 'step' : undefined}
                className="flex items-center gap-2"
              >
                {StepContent}
              </div>
            )}
            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  'mx-1 size-4',
                  step.id < activeStep ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
