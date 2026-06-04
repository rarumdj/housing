import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { type PhoneData, PhoneInput, type PhoneInputProps } from './atoms/phone-input';
import FormController from './form-controller';

type FormPhoneInputProps<T extends FieldValues> = PhoneInputProps & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  onPhoneChange?: (data: PhoneData | null) => void;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
};

const FormPhoneInput = <T extends FieldValues,>({
  name,
  control,
  label,
  placeholder,
  description,
  onPhoneChange,
  orientation,
  defaultCountry = 'NG',
}: FormPhoneInputProps<T>) => {
  return (
    <FormController
      name={name}
      control={control}
      label={label}
      description={description}
      orientation={orientation}
      render={({ field, fieldState }) => (
        <PhoneInput
          {...field}
          defaultCountry={defaultCountry}
          placeholder={placeholder}
          onPhoneChange={onPhoneChange}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
};

export default FormPhoneInput;
