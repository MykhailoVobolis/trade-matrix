import {
  BarChart3Icon,
  Building2Icon,
  MapPinnedIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewResponse } from "@/lib/overview/overview-api";
import {
  formatCompactCurrency,
  formatDelta,
  formatNumber,
} from "@/lib/overview/overview-format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const kpiCards = [
  {
    title: "Продажі з ПДВ",
    icon: BarChart3Icon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні постачальники",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Регіони збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

export function OverviewKpiGrid({
  kpi,
  isLoading,
  error,
  comparisonEnabled = true,
  onRetry,
}: {
  kpi?: OverviewResponse["kpi"];
  isLoading: boolean;
  error: string | null;
  comparisonEnabled?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const metric = kpi
          ? [
              kpi.salesWithVat,
              kpi.activeBuyers,
              kpi.activeSuppliers,
              kpi.salesRegions,
            ][index]
          : undefined;
        const value =
          index < 1
            ? formatCompactCurrency(metric?.current)
            : formatNumber(metric?.current);

        return (
          <Card
            key={card.title}
            size="sm"
            className={
              isLoading
                ? "border border-border/70 shadow-none"
                : "flex h-full border border-border/70 shadow-none"
            }
          >
            <CardHeader className="gap-2 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[0.78rem] leading-snug text-muted-foreground">
                    {card.title}
                  </p>
                  <CardTitle>
                    {isLoading ? <Skeleton className="h-6 w-20" /> : value}
                  </CardTitle>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent
              className={
                isLoading
                  ? "pt-0"
                  : "flex flex-1 flex-col justify-end space-y-1.5 pt-0"
              }
            >
              {isLoading ? (
                <Skeleton className="h-4 w-40 max-w-full" />
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">{error}</p>
                  {onRetry ? (
                    <Button size="xs" variant="outline" onClick={onRetry}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              ) : !comparisonEnabled ? (
                <p className="text-xs text-muted-foreground">&nbsp;</p>
              ) : metric ? (
                <p className="text-xs text-muted-foreground">
                  {formatDelta(metric)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
