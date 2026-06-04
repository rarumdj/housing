import FormController from '@/components/forms/form-controller';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { TextInput } from './atoms/text-input';
import type { InputProps } from './atoms/variants';

interface FormInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
}

export const FormInput = <T extends FieldValues,>({
  control,
  name,
  label,
  description,
  ...inputProps
}: FormInputProps<T>) => {
  return (
    <FormController
      control={control}
      name={name}
      label={label}
      description={description}
      render={({ field, fieldState }) => (
        <TextInput {...inputProps} {...field} aria-invalid={fieldState.invalid} />
      )}
    />
  );
};
