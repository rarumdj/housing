import CurrencyFormat from "react-currency-format";
import { convertNaNToZero } from "@/lib/utils";

export interface FormattedCurrencyProps {
  className?: string;
  value: number | string | null | undefined;
  prefix?: string;
  kobo?: boolean;
  decimalScale?: number | null;
}

export const FormattedCurrency = ({
  className,
  value,
  prefix,
  decimalScale = 2,
  kobo = false,
}: FormattedCurrencyProps) => {
  const formattedValue = convertNaNToZero((Number(value) / 100).toFixed(2));

  return (
    <CurrencyFormat
      value={kobo ? formattedValue : value}
      displayType="text"
      thousandSeparator={true}
      prefix={`${prefix ?? ""} `}
      decimalScale={decimalScale ?? undefined}
      fixedDecimalScale={true}
      className={className}
      isNumericString
      renderText={(formattedValue) => {
        const [integerPart, decimalPart] = formattedValue.split(".");
        return (
          <span className="m-0 p-0">
            {integerPart}
            {decimalPart && <span className="m-0 p-0">.{decimalPart}</span>}
          </span>
        );
      }}
    />
  );
};
