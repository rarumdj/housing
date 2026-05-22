import FormController from '@/components/forms/form-controller';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { PasswordInput, type PasswordInputProps } from './atoms/password-input';

export interface FormPasswordInputProps<T extends FieldValues>
  extends PasswordInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
}

export function FormPasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...passwordProps
}: FormPasswordInputProps<T>) {
  return (
    <FormController
      control={control}
      name={name}
      label={label}
      description={description}
      render={({ field, fieldState }) => (
        <PasswordInput {...field} {...passwordProps} aria-invalid={fieldState.invalid} />
      )}
    />
  );
}
