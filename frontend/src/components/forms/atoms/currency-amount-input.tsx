import { useMemo, useState } from 'react';
import {
  formatNumeral,
  NumeralThousandGroupStyles,
  type FormatNumeralOptions,
} from 'cleave-zen';
import { FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
  { code: 'GHS', symbol: '₵' },
  { code: 'KES', symbol: 'KSh' },
  { code: 'ZAR', symbol: 'R' },
] as const;

const numeralOptions: FormatNumeralOptions = {
  delimiter: ',',
  numeralThousandsGroupStyle: NumeralThousandGroupStyles.THOUSAND,
};

interface CurrencyAmountInputProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  /** Optional controlled currency; falls back to internal state (default NGN). */
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const CurrencyAmountInput = ({
  label,
  value,
  onChange,
  currency,
  onCurrencyChange,
  placeholder = '0',
  required,
}: CurrencyAmountInputProps) => {
  const [internalCurrency, setInternalCurrency] = useState('NGN');
  const selected = currency ?? internalCurrency;
  const setCurrency = (c: string) => (onCurrencyChange ? onCurrencyChange(c) : setInternalCurrency(c));

  const formatted = useMemo(() => {
    if (value === undefined || value === null) return '';
    return formatNumeral(String(value), numeralOptions);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumeral(event.target.value, numeralOptions);
    const raw = formattedValue.split(',').join('');
    onChange(raw === '' ? undefined : Number(raw));
  };

  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <div className="flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <select
          value={selected}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Currency"
          className="shrink-0 border-0 border-r border-input bg-muted/40 px-2.5 text-sm font-medium outline-none"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
        <input
          type="text"
          inputMode="decimal"
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm outline-none',
            'placeholder:text-muted-foreground',
          )}
        />
      </div>
    </div>
  );
};
