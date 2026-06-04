import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import FormController from './form-controller';
import { OtpInput } from './atoms/otp-input';
import type { OtpInputProps } from './atoms/variants';

type FormOtpInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  maxLength?: number;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
} & OtpInputProps;

const FormOtpInput = <T extends FieldValues,>({
  name,
  control,
  label,
  description,
  orientation,
  ...otpInputProps
}: FormOtpInputProps<T>) => {
  return (
    <FormController
      name={name}
      control={control}
      label={label}
      description={description}
      orientation={orientation}
      render={({ field, fieldState }) => (
        <OtpInput {...otpInputProps} {...field} aria-invalid={fieldState.invalid} />
      )}
    />
  );
};

export default FormOtpInput;
