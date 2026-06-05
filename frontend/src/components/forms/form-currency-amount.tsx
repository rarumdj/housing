import type * as React from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import FormController from './form-controller';
import { CurrencyAmountInput } from './atoms/currency-amount-input';

interface FormCurrencyAmountProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  placeholder?: string;
  required?: boolean;
  description?: React.ReactNode;
}

export const FormCurrencyAmount = <T extends FieldValues>({
  control,
  name,
  label,
  currency,
  onCurrencyChange,
  placeholder,
  required,
  description,
}: FormCurrencyAmountProps<T>) => (
  <FormController
    control={control}
    name={name}
    description={description}
    render={({ field }) => (
      <CurrencyAmountInput
        label={label}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        placeholder={placeholder}
        required={required}
        value={field.value as number | undefined}
        onChange={(value) => field.onChange(value ?? 0)}
      />
    )}
  />
);
