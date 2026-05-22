import * as React from 'react';
// phone number input
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { parsePhoneNumber } from 'react-phone-number-input';
import { cn } from '@/lib/utils';
import { type SelectOption, Select } from './select';
import { TextInput } from './text-input';
import type { VariantProps } from 'class-variance-authority';
import type { inputVariants } from './variants';

export interface PhoneData {
  countryCode: string; // Calling code, e.g. "234"
  localFormat: string; // National number, e.g. "8012345678"
  internationalFormat: string; // E.164, e.g. "+2348012345678"
  country: string; // ISO code, e.g. "NG"
}

export type PhoneInputProps = Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'ref' | 'size'
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
    onPhoneChange?: (data: PhoneData | null) => void;
    size?: VariantProps<typeof inputVariants>['size'];
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = React.forwardRef<
  React.ComponentRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, onPhoneChange, value, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={(libProps) => (
        <CountrySelect {...libProps} size={props?.size ?? 'default'} />
      )}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => {
        onChange?.(value || ('' as RPNInput.Value));
        if (onPhoneChange) {
          if (value) {
            const parsed = parsePhoneNumber(value);
            if (parsed) {
              onPhoneChange({
                countryCode: parsed.countryCallingCode,
                localFormat: parsed.nationalNumber,
                internationalFormat: parsed.number,
                country: parsed.country || '',
              });
            } else {
              onPhoneChange(null);
            }
          } else {
            onPhoneChange(null);
          }
        }
      }}
      {...props}
    />
  );
});
PhoneInput.displayName = 'PhoneInput';

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof TextInput>
>(({ className, ...props }, ref) => (
  <TextInput
    className={cn('rounded-e-lg rounded-s-none', className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = 'InputComponent';

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  size?: VariantProps<typeof inputVariants>['size'];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
  size = 'default',
}: CountrySelectProps) => {
  const options: SelectOption[] = React.useMemo(() => {
    return countryList
      .filter((country) => country.value)
      .map((country) => {
        const iso = country.value as RPNInput.Country;
        const callingCode = RPNInput.getCountryCallingCode(iso);
        return {
          value: country.value as string,
          searchLabel: `${country.label} +${callingCode}`,
          label: (
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="truncate w-32">{country.label}</span>
              <span className="text-sm text-muted-foreground">+{callingCode}</span>
            </div>
          ),
          icon: ({ className }) => (
            <FlagComponent
              country={country.value as RPNInput.Country}
              countryName={country.label}
              className={cn('size-5 shrink-0', className)}
            />
          ),
        };
      });
  }, [countryList]);

  return (
    <Select
      options={options}
      value={selectedCountry}
      onChange={(value) => onChange(value as RPNInput.Country)}
      disabled={disabled}
      searchable
      searchPlaceholder="Search country..."
      placeholder={<span className="flex size-5 shrink-0 rounded-full bg-muted" />}
      className="gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10 w-18 hover:bg-transparent aria-expanded:bg-transparent enabled:hover:bg-transparent enabled:hover:translate-y-0 enabled:hover:shadow-none enabled:active:scale-100"
      popoverClassName="w-[300px]"
      size={size}
    />
  );
};

const FlagComponent = ({
  country,
  countryName,
  className,
}: RPNInput.FlagProps & { className?: string }) => {
  const Flag = flags[country];

  return (
    <span
      className={cn(
        'relative flex size-5 overflow-hidden rounded-full bg-muted',
        '[&_svg]:size-full! [&_svg]:absolute [&_svg]:inset-1/2 [&_svg]:object-cover [&_svg]:block [&_svg]:-translate-1/2 [&_svg]:scale-140',
        className
      )}
    >
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
