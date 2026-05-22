import * as React from 'react';
import {
  formatNumeral,
  type FormatNumeralOptions,
  NumeralThousandGroupStyles,
} from 'cleave-zen';
import { cn } from '@/lib/utils';
import { TextInput } from './text-input';
import type { InputProps } from './variants';

interface AmountInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: string) => void; // raw numeric value
  options?: FormatNumeralOptions;
}

const defaultOptions: FormatNumeralOptions = {
  delimiter: ',',
  numeralThousandsGroupStyle: NumeralThousandGroupStyles.THOUSAND,
};

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, value, onChange, options, ...props }, ref) => {
    const config = React.useMemo<FormatNumeralOptions>(
      () => ({ ...defaultOptions, ...options }),
      [options]
    );

    const formattedValue = React.useMemo(() => {
      if (value === undefined || value === null || value === '') return '';
      return formatNumeral(String(value), config);
    }, [value, config]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatNumeral(event.target.value, config);
      const delimiter = config.delimiter ?? ',';
      const raw = formatted.split(delimiter).join('');
      onChange?.(raw);
    };

    return (
      <TextInput
        ref={ref}
        type="text"
        inputMode="decimal"
        value={formattedValue}
        onChange={handleChange}
        className={cn(className)}
        {...props}
      />
    );
  }
);

AmountInput.displayName = 'AmountInput';
