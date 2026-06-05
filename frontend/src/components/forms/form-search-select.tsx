import type * as React from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import FormController from './form-controller';
import { SearchSelect, type SearchSelectOption } from './atoms/search-select';

interface FormSearchSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: React.ReactNode;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  /** Optional side-effect to run after the value changes (e.g. resetting a dependent field). */
  onValueChange?: (value: string) => void;
}

export const FormSearchSelect = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  onValueChange,
  ...rest
}: FormSearchSelectProps<T>) => (
  <FormController
    control={control}
    name={name}
    description={description}
    render={({ field }) => (
      <SearchSelect
        {...rest}
        label={label}
        value={(field.value as string) ?? ''}
        onChange={(value) => {
          field.onChange(value);
          onValueChange?.(value);
        }}
      />
    )}
  />
);
