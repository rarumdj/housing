import FormController from '@/components/forms/form-controller';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { MultiSelect, type MultiSelectProps } from './atoms/multi-select';

interface FormMultiSelectProps<T extends FieldValues>
  extends Omit<MultiSelectProps, 'defaultValue' | 'onValueChange'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
}

export const FormMultiSelect = <T extends FieldValues,>({
  control,
  name,
  label,
  description,
  ...props
}: FormMultiSelectProps<T>) => {
  return (
    <FormController
      control={control}
      name={name}
      label={label}
      description={description}
      render={({ field, fieldState }) => (
        <MultiSelect
          {...props}
          defaultValue={field.value || []}
          onValueChange={field.onChange}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
};
