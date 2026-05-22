import FormController from '@/components/forms/form-controller';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { type SelectOption, Select, type SelectProps } from './atoms/select';

export interface FormSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'onChange'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  options,
  searchable,
  searchPlaceholder,
  disabled,
  size,
  className,
}: FormSelectProps<T>) {
  return (
    <FormController
      control={control}
      name={name}
      label={label}
      description={description}
      render={({ field, fieldState }) => (
        <Select
          {...field}
          options={options}
          placeholder={placeholder}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
          size={size}
          className={className}
          onChange={field.onChange}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
}
