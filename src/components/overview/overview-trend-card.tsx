import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { OverviewTrendItem } from "@/lib/overview/overview-api";
import { formatCompactCurrency } from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewTimeGrain } from "@/lib/overview/overview-url-state";

const timeGrainOptions: Array<{
  value: OverviewTimeGrain | "";
  label: string;
}> = [
  { value: "", label: "Авто" },
  { value: "MONTH", label: "Місяць" },
  { value: "QUARTER", label: "Квартал" },
  { value: "YEAR", label: "Рік" },
];

function OverviewTrendTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload.filter((item) => typeof item.value === "number");

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-md border border-border/70 bg-background px-3 py-2 shadow-sm">
      <p className="mb-2 text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={`${item.dataKey}-${item.name}`}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatCompactCurrency(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTrendTick({
  x = 0,
  y = 0,
  index,
  payload,
  trendData = [],
}: {
  x?: number;
  y?: number;
  index?: number;
  payload?: {
    value?: string;
  };
  trendData?: OverviewTrendItem[];
}) {
  const salesWithVat =
    typeof index === "number" ? (trendData[index]?.salesWithVat ?? 0) : 0;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-medium"
      >
        {payload?.value ?? ""}
      </text>
      <text
        x={0}
        y={0}
        dy={31}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {formatCompactCurrency(salesWithVat)}
      </text>
    </g>
  );
}

export function OverviewTrendCard({
  trend,
  isLoading,
  isFetching,
  error,
  timeGrain,
  comparisonEnabled = true,
  onRetry,
  onTimeGrainChange,
  printMode = false,
}: {
  trend: OverviewTrendItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  timeGrain: OverviewTimeGrain | "";
  comparisonEnabled?: boolean;
  onRetry?: () => void;
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
  printMode?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const resolvedTimeGrain: OverviewTimeGrain | "" = timeGrain;
  const resolvedTimeGrainLabel =
    timeGrainOptions.find((option) => option.value === resolvedTimeGrain)
      ?.label ?? "Авто";
  const comparisonSalesLineColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--sidebar-primary) 82%, white)"
      : "color-mix(in oklab, var(--sidebar-primary) 75%, white)";
  const hasComparisonSales = trend.some(
    (item) => (item.comparisonSalesWithVat ?? 0) > 0,
  );
  const chartData = trend.map((item) => ({
    ...item,
    comparisonSalesWithVat:
      comparisonEnabled && hasComparisonSales
        ? item.comparisonSalesWithVat
        : null,
  }));
  const chartTick = useMemo(
    () => <OverviewTrendTick trendData={chartData} />,
    [chartData],
  );

  return (
    <Card
      className="border border-border/70 shadow-none"
      style={
        printMode
          ? {
              borderColor: "#d4d4d8",
              backgroundColor: "#ffffff",
            }
          : undefined
      }
    >
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="print-text">Продажі за період</CardTitle>

        {printMode ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="print-text rounded-md border border-border/70 bg-background px-3 py-2">
              {resolvedTimeGrainLabel}
            </span>
            <span className="print-text rounded-md border border-border/70 bg-background px-3 py-2">
              Сума
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={resolvedTimeGrain || "__AUTO__"}
              onValueChange={(value) =>
                onTimeGrainChange(
                  value === "__AUTO__" ? "" : (value as OverviewTimeGrain),
                )
              }
            >
              <SelectTrigger className="h-9 min-w-36 rounded-md">
                <SelectValue>{resolvedTimeGrainLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent className="p-1">
                {timeGrainOptions.map((option) => (
                  <SelectItem
                    key={option.value || "__AUTO__"}
                    value={option.value || "__AUTO__"}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
              <span>Сума</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary" />
            <span className="print-text">Продажі з ПДВ</span>
          </div>
          {comparisonEnabled ? (
            <div className="flex items-center gap-2">
              <span
                className="h-px w-6 border-t border-dashed"
                style={{ borderColor: comparisonSalesLineColor }}
              />
              <span className="print-text">Попер. період</span>
            </div>
          ) : null}
        </div>

        <div
          className="rounded-md border border-border/70 bg-muted/15 p-4"
          style={
            printMode
              ? {
                  borderColor: "#d4d4d8",
                  backgroundColor: "#ffffff",
                }
              : undefined
          }
        >
          {isLoading ? (
            <Skeleton className="h-[320px] w-full rounded-md" />
          ) : error ? (
            <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-sm text-destructive">
              <span>{error}</span>
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : trend.length === 0 ? (
            <div className="print-text flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              No trend data
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 16, right: 8, left: 8, bottom: 20 }}
                  barCategoryGap={trend.length <= 6 ? "24%" : "18%"}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.45}
                  />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={12}
                    minTickGap={16}
                    height={56}
                    tick={chartTick}
                  />
                  <YAxis hide />
                  <Tooltip cursor={false} content={<OverviewTrendTooltip />} />
                  <Bar
                    dataKey="salesWithVat"
                    name="Продажі з ПДВ"
                    fill="var(--sidebar-primary)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={24}
                    isAnimationActive={!printMode}
                  />
                  {comparisonEnabled && hasComparisonSales ? (
                    <Line
                      type="monotone"
                      dataKey="comparisonSalesWithVat"
                      name="Продажі з ПДВ · попер. період"
                      stroke={comparisonSalesLineColor}
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={!printMode}
                    />
                  ) : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {isFetching && !isLoading ? (
          <p className="print-text text-xs text-muted-foreground">
            Updating overview...
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
