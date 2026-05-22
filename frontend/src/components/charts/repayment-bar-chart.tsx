import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export interface RepaymentBarChartDataPoint {
  month: string;
  expected: number;
  collected: number;
}

export interface RepaymentBarChartProps {
  data: RepaymentBarChartDataPoint[];
  /** Currency symbol for tooltip (e.g. '₦') */
  currencySymbol?: string;
  className?: string;
  /** Height of the chart area */
  height?: number;
}

const CHART_CONFIG: ChartConfig = {
  expected: {
    label: 'Expected Repayment',
    color: 'hsl(24 95% 90%)', // light orange
  },
  collected: {
    label: 'Reported Repayment',
    color: 'hsl(24 95% 50%)', // vibrant orange
  },
};

function formatAxisValue(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  if (value >= 1_000) return `${value / 1_000}K`;
  return String(value);
}

function formatTooltipValue(value: number, currencySymbol: string): string {
  return `${currencySymbol}${value.toLocaleString()}`;
}

export function RepaymentBarChart({
  data,
  currencySymbol = '₦',
  className,
  height = 320,
}: RepaymentBarChartProps) {
  return (
    <ChartContainer
      config={CHART_CONFIG}
      className={cn('w-full', className)}
      style={{ height }}
    >
      <RechartsBarChart
        data={data}
        margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
        barGap={4}
        barCategoryGap="20%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatAxisValue}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, (max: number) => Math.ceil((max * 1.1) / 1_000_000) * 1_000_000]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatTooltipValue(Number(value), currencySymbol)}
            />
          }
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ paddingBottom: 16 }}
          iconType="square"
          iconSize={10}
          formatter={(value) => (
            <span className="text-muted-foreground text-xs">
              {CHART_CONFIG[value as keyof typeof CHART_CONFIG]?.label ?? value}
            </span>
          )}
        />
        <Bar
          dataKey="expected"
          fill="var(--color-expected)"
          radius={[0, 0, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey="collected"
          fill="var(--color-collected)"
          radius={[0, 0, 0, 0]}
          maxBarSize={32}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
}
