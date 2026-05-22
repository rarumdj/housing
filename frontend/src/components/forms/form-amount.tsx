import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import FormController from './form-controller';
import { AmountInput } from './atoms/amount-input';

type FormAmountProps<T extends FieldValues> = React.ComponentProps<typeof AmountInput> & {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  description?: string;
};

export const CustomAmount = <T extends FieldValues>({
  name,
  control,
  label,
  description,
  ...amountProps
}: FormAmountProps<T>) => {
  return (
    <FormController
      name={name}
      control={control}
      label={label}
      description={description}
      render={({ field: { onChange, value, ...field }, fieldState }) => (
        <AmountInput
          {...field}
          {...amountProps}
          value={value}
          onChange={onChange}
          aria-invalid={fieldState.invalid}
        />
      )}
    />
  );
};
