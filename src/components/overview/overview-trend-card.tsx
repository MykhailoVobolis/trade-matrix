import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OverviewTrendItem } from "@/lib/overview/overview-api";
import { formatCompactCurrency } from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewTimeGrain } from "@/lib/overview/overview-url-state";

const timeGrainOptions: Array<{
  value: OverviewTimeGrain;
  label: string;
}> = [
  { value: "MONTH", label: "Місяць" },
  { value: "QUARTER", label: "Квартал" },
];

export function OverviewTrendCard({
  trend,
  isLoading,
  isFetching,
  error,
  timeGrain,
  onTimeGrainChange,
}: {
  trend: OverviewTrendItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  timeGrain: OverviewTimeGrain | "";
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
}) {
  const resolvedTimeGrain: OverviewTimeGrain = timeGrain || "MONTH";
  const resolvedTimeGrainLabel =
    timeGrainOptions.find((option) => option.value === resolvedTimeGrain)
      ?.label ?? "Місяць";
  const maxValue = Math.max(
    1,
    ...trend.flatMap((item) => [
      item.salesWithVat,
      item.purchasesWithVat,
      item.comparisonSalesWithVat ?? 0,
      item.comparisonPurchasesWithVat ?? 0,
    ]),
  );
  const pointCount = trend.length || 1;
  const barWidthClass =
    pointCount <= 4
      ? "w-8 xl:w-10"
      : pointCount <= 8
        ? "w-6 xl:w-7"
        : pointCount <= 12
          ? "w-4 xl:w-5"
          : "w-3.5 xl:w-4";

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Продажі та закупівлі за період</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={resolvedTimeGrain}
            onValueChange={(value) =>
              onTimeGrainChange(value as OverviewTimeGrain)
            }
          >
            <SelectTrigger className="h-9 min-w-36 rounded-md">
              <SelectValue>{resolvedTimeGrainLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent className="p-1">
              {timeGrainOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <span>Сума</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary" />
            Продажі з ПДВ
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary/25" />
            Закупівлі з ПДВ
          </div>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-muted-foreground/60" />
            Попер. період
          </div>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/15 p-4">
          {isLoading ? (
            <Skeleton className="h-[320px] w-full rounded-md" />
          ) : error ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-destructive">
              {error}
            </div>
          ) : trend.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              No trend data
            </div>
          ) : (
            <div className="grid h-[320px] grid-flow-col auto-cols-fr items-end gap-2 overflow-hidden">
              {trend.map((item) => (
                <div
                  key={`${item.periodStart}-${item.periodLabel}`}
                  className="flex min-w-0 flex-col items-center gap-2"
                >
                  <div className="flex h-60 items-end gap-1.5">
                    <div
                      className={`${barWidthClass} rounded-t-[4px] bg-sidebar-primary`}
                      style={{
                        height: `${Math.max(8, (item.salesWithVat / maxValue) * 100)}%`,
                      }}
                      title={formatCompactCurrency(item.salesWithVat)}
                    />
                    <div
                      className={`${barWidthClass} rounded-t-[4px] bg-sidebar-primary/25`}
                      style={{
                        height: `${Math.max(8, (item.purchasesWithVat / maxValue) * 100)}%`,
                      }}
                      title={formatCompactCurrency(item.purchasesWithVat)}
                    />
                  </div>
                  <div className="w-full space-y-1 text-center">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {item.periodLabel}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {formatCompactCurrency(item.salesWithVat)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isFetching && !isLoading ? (
          <p className="text-xs text-muted-foreground">Updating overview...</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
