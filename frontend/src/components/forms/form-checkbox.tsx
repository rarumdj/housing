import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import FormController from './form-controller';
import type React from 'react';

type FormCheckboxProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string | React.ReactNode;
  description?: string;
  disabled?: boolean;
};

function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  description,
  disabled,
}: FormCheckboxProps<T>) {
  return (
    <FormController
      name={name}
      control={control}
      description={description}
      render={({ field, fieldState }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          {label && (
            <FieldLabel
              htmlFor={name}
              className="cursor-pointer text-accent-foreground text-sm"
              onClick={() => field.onChange(!field.value)}
            >
              {label}
            </FieldLabel>
          )}
        </div>
      )}
    />
  );
}

export default FormCheckbox;
