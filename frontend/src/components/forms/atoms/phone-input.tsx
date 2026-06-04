import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import * as FlagIcons from "country-flag-icons/react/1x1";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from "react-phone-number-input";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TextInput } from "./text-input";
import { inputVariants } from "./variants";

export interface PhoneData {
  countryCode: string;
  localFormat: string;
  internationalFormat: string;
  country: string;
}

export type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref" | "size"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
    onPhoneChange?: (data: PhoneData | null) => void;
    size?: VariantProps<typeof inputVariants>["size"];
  };

const triggerSizeClass: Record<NonNullable<PhoneInputProps["size"]>, string> = {
  default: "h-10",
  sm: "h-8",
  lg: "h-12",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

type CountryOption = {
  iso: RPNInput.Country;
  label: string;
  callingCode: string;
};

const ALL_COUNTRIES: CountryOption[] = getCountries().map((iso) => ({
  iso,
  label: regionNames.of(iso) ?? iso,
  callingCode: getCountryCallingCode(iso),
}));

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<
    React.ComponentRef<typeof RPNInput.default>,
    PhoneInputProps
  >(
    (
      { className, onChange, onPhoneChange, value, size = "default", ...props },
      ref,
    ) => {
      const SizedInput = React.useMemo(
        () =>
          React.forwardRef<
            HTMLInputElement,
            React.ComponentProps<typeof TextInput>
          >((inputProps, inputRef) => {
            return (
              <InputComponent {...inputProps} ref={inputRef} size={size} />
            );
          }),
        [size],
      );

      return (
        <RPNInput.default
          ref={ref}
          className={cn(
            "PhoneInput flex w-full items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow]",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20",
            "[&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-stretch",
            "[&_.PhoneInputCountryIcon]:hidden [&_.PhoneInputCountrySelectArrow]:hidden",
            className,
          )}
          flagComponent={FlagComponent}
          countrySelectComponent={(libProps) => (
            <CountrySelect {...libProps} size={size} />
          )}
          inputComponent={SizedInput}
          smartCaret={false}
          value={value || undefined}
          onChange={(nextValue) => {
            onChange?.(nextValue || ("" as RPNInput.Value));
            if (!onPhoneChange) return;
            if (nextValue) {
              const parsed = parsePhoneNumber(nextValue);
              if (parsed) {
                onPhoneChange({
                  countryCode: parsed.countryCallingCode,
                  localFormat: parsed.nationalNumber,
                  internationalFormat: parsed.number,
                  country: parsed.country || "",
                });
              } else {
                onPhoneChange(null);
              }
            } else {
              onPhoneChange(null);
            }
          }}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof TextInput> & { size?: PhoneInputProps["size"] }
>(({ className, size, ...props }, ref) => (
  <TextInput
    className={cn(
      "min-w-0 flex-1 rounded-none rounded-e-lg border-0 border-l border-input shadow-none",
      "focus-visible:border-input focus-visible:ring-0",
      inputVariants({ size }),
      className,
    )}
    ref={ref}
    size={size}
    {...props}
  />
));
InputComponent.displayName = "InputComponent";

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  size?: VariantProps<typeof inputVariants>["size"];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  onChange,
  size = "default",
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selectedOptionRef = React.useRef<HTMLButtonElement>(null);

  const selectedLabel =
    ALL_COUNTRIES.find((c) => c.iso === selectedCountry)?.label ??
    selectedCountry;

  const filteredCountries = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ALL_COUNTRIES;

    return ALL_COUNTRIES.filter((country) => {
      const haystack =
        `${country.label} ${country.iso} +${country.callingCode} ${country.callingCode}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  const scrollSelectedIntoView = React.useCallback(() => {
    selectedOptionRef.current?.scrollIntoView({ block: "center" });
  }, []);

  React.useLayoutEffect(() => {
    if (!open || !selectedCountry) return;
    scrollSelectedIntoView();
    const frame = requestAnimationFrame(scrollSelectedIntoView);
    return () => cancelAnimationFrame(frame);
  }, [open, selectedCountry, search, scrollSelectedIntoView]);

  const handleSelect = (iso: RPNInput.Country) => {
    onChange(iso);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger
        type="button"
        disabled={disabled}
        aria-label={`Country: ${selectedLabel}`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-s-lg border-0 bg-transparent px-2.5",
          "text-foreground transition-colors hover:bg-muted/60",
          "focus-visible:outline-none focus-visible:ring-0",
          "disabled:pointer-events-none disabled:opacity-50",
          triggerSizeClass[size ?? "default"],
        )}
      >
        <FlagComponent
          country={selectedCountry}
          countryName={selectedLabel}
          className="size-5"
        />
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className="z-[200] w-[min(320px,calc(100vw-2rem))] overflow-hidden p-0"
      >
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search country..."
              className="h-9 rounded-full border-border bg-muted/50 pl-9 text-sm"
            />
          </div>
        </div>
        <ul
          className="max-h-[280px] overflow-y-auto overscroll-contain p-1"
          role="listbox"
          aria-label="Countries"
          aria-activedescendant={
            selectedCountry ? `phone-country-${selectedCountry}` : undefined
          }
        >
          {filteredCountries.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No country found.
            </li>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = country.iso === selectedCountry;
              return (
                <li
                  key={country.iso}
                  id={isSelected ? `phone-country-${country.iso}` : undefined}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    ref={isSelected ? selectedOptionRef : undefined}
                    type="button"
                    data-selected={isSelected ? "" : undefined}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 ring-1 ring-inset ring-primary/25"
                        : "hover:bg-muted/80",
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleSelect(country.iso);
                    }}
                  >
                    <FlagComponent
                      country={country.iso}
                      countryName={country.label}
                      className="size-6 shrink-0"
                    />
                    <span className="flex-1 truncate text-sm font-medium text-primary">
                      {country.label}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      +{country.callingCode}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

type FlagIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { title?: string }
>;

const FlagComponent = ({
  country,
  countryName,
  className,
}: RPNInput.FlagProps & { className?: string }) => {
  const Flag = (FlagIcons as Record<string, FlagIcon>)[country];

  return (
    <span
      data-slot="phone-flag"
      title={countryName}
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60",
        "size-5",
        className,
      )}
    >
      {Flag ? (
        <Flag
          title={countryName}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full"
        />
      ) : null}
    </span>
  );
};

export { PhoneInput };
