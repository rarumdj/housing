import React from 'react';
import { EyeIcon, EyeOffIcon, Circle, CircleCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { inputVariants, type InputProps } from './variants';

export const passwordChecklist = [
  {
    label: 'At least 8 characters',
    validate: (value: string) => value.length >= 8,
  },
  {
    label: 'Contains a number',
    validate: (value: string) => /\d/.test(value),
  },
  {
    label: 'Contains an uppercase letter',
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: 'Contains a lowercase letter',
    validate: (value: string) => /[a-z]/.test(value),
  },
  {
    label: 'Contains a special character',
    validate: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
];

export const areAllPasswordRulesMet = (value: string | undefined | null): boolean => {
  if (typeof value !== 'string') return false;
  return passwordChecklist.every((rule) => rule.validate(value));
};

interface PasswordRuleCheckerProps {
  value: string;
  className?: string;
  showOnlyUnmet?: boolean;
  hideWhenAllMet?: boolean;
}

export const PasswordRuleChecker = ({
  value,
  className,
  showOnlyUnmet = false,
  hideWhenAllMet = true,
}: PasswordRuleCheckerProps) => {
  const allRulesMet = React.useMemo(() => areAllPasswordRulesMet(value), [value]);

  const rulesToShow = showOnlyUnmet
    ? passwordChecklist.filter((rule) => !rule.validate(value))
    : passwordChecklist;

  if (!value || (allRulesMet && hideWhenAllMet) || (allRulesMet && showOnlyUnmet)) {
    return null;
  }

  return (
    <ul className={cn('space-y-1', className)}>
      {rulesToShow.map((rule, index) => {
        const isValid = rule.validate(value);
        return (
          <li
            key={index}
            className={cn(
              'flex items-center gap-1 text-sm',
              isValid ? 'text-primary' : 'text-destructive'
            )}
          >
            {isValid ? <CircleCheck className="size-3" /> : <Circle className="size-3" />}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
};
PasswordRuleChecker.displayName = 'PasswordRuleChecker';

export interface PasswordInputProps extends InputProps {
  checklist?: boolean;
  wrapperClassName?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, size, checklist = false, wrapperClassName, disabled, value, ...props },
    ref
  ) {
    const [showPassword, setShowPassword] = React.useState(false);
    const isToggleDisabled = disabled || value === '' || value === undefined;

    return (
      <div className={cn('space-y-1', wrapperClassName)}>
        <div className="relative w-full">
          <Input
            ref={ref}
            data-slot="input"
            disabled={disabled}
            value={value}
            placeholder="Enter password"
            type={showPassword ? 'text' : 'password'}
            className={cn(
              inputVariants({ size }),
              'hide-password-toggle pr-10',
              className
            )}
            {...props}
          />
          <button
            type="button"
            disabled={isToggleDisabled}
            onClick={() => setShowPassword((prev) => !prev)}
            onMouseDown={(e) => e.preventDefault()}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute top-1/2 right-2 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {showPassword && !isToggleDisabled ? (
              <EyeIcon className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="size-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        </div>

        {checklist && value ? <PasswordRuleChecker value={value as string} /> : null}

        <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
