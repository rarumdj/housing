import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import FormController from './form-controller';

type FormTextareaProps<T extends FieldValues> = React.ComponentProps<typeof Textarea> & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  description?: string;
};

const FormTextarea = <T extends FieldValues,>({
  name,
  control,
  label,
  placeholder,
  description,
  ...inputProps
}: FormTextareaProps<T>) => {
  return (
    <FormController
      name={name}
      control={control}
      label={label}
      description={description}
      render={({ field, fieldState }) => (
        <Textarea
          placeholder={placeholder}
          {...field}
          {...inputProps}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
};

export default FormTextarea;
