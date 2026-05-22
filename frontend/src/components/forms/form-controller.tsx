import type * as React from 'react';
import { Controller } from 'react-hook-form';
import type {
  Control,
  FieldPath,
  FieldValues,
  ControllerFieldState,
  ControllerRenderProps,
  FormState,
} from 'react-hook-form';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

export interface FormControllerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  render: (props: {
    field: ControllerRenderProps<T, FieldPath<T>>;
    fieldState: ControllerFieldState;
    formState: FormState<T>;
  }) => React.ReactElement;
  className?: string;
  fieldClassName?: string;
}

export function FormController<T extends FieldValues>({
  name,
  control,
  label,
  description,
  orientation = 'vertical',
  render,
  className,
  fieldClassName,
}: FormControllerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => (
        <Field
          orientation={orientation}
          data-invalid={fieldState.invalid}
          className={className}
        >
          {label && (
            <FieldLabel
              htmlFor={name}
              className={cn(
                'text-accent-foreground font-semibold text-sm',
                fieldClassName
              )}
            >
              {label}
            </FieldLabel>
          )}
          <FieldContent>{render({ field, fieldState, formState })}</FieldContent>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

export default FormController;
