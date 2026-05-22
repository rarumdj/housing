import React from 'react';

type ColoredValue = {
  color?: string;
  sign?: React.ReactNode;
  value?: React.ReactNode;
};

function isColoredValue(value: unknown): value is ColoredValue {
  return (
    typeof value === 'object' && value !== null && ('color' in value || 'value' in value)
  );
}

const StringType = React.memo(
  ({
    value,
    fontBold,
    withSubString,
    withColor,
  }: {
    value: unknown;
    fontBold?: boolean;
    withSubString?: string;
    withColor?: boolean;
  }) => {
    if (!value) return <div />;

    return (
      <span className={`text-sm text-muted-foreground ${fontBold ? 'font-bold' : ''}`}>
        <div>
          {withColor && isColoredValue(value) ? (
            <span
              style={{
                color: `${value.color || '#0000'}`,
              }}
            >
              {value.sign && value.sign} {value.value}
            </span>
          ) : (
            (value as React.ReactNode)
          )}

          {withSubString && <p className="text-xs">{withSubString}</p>}
        </div>
      </span>
    );
  }
);
export default StringType;
