import {
  ActivityIcon,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  MapPinnedIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    title: "Закупівлі з ПДВ",
    icon: ShoppingCartIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Сальдо продажі / закупівлі",
    icon: ActivityIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні постачальники",
    icon: BriefcaseBusinessIcon,
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
  onRetry,
}: {
  kpi?: OverviewResponse["kpi"];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const metric = kpi
          ? [
              kpi.salesWithVat,
              kpi.purchasesWithVat,
              kpi.balance,
              kpi.activeBuyers,
              kpi.activeSuppliers,
              kpi.salesRegions,
            ][index]
          : undefined;
        const value =
          index < 3
            ? formatCompactCurrency(metric?.current)
            : formatNumber(metric?.current);

        return (
          <Card
            key={card.title}
            size="sm"
            className="flex h-full border border-border/70 shadow-none"
          >
            <CardHeader className="gap-2 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <CardDescription className="text-[0.78rem] leading-snug">
                    {card.title}
                  </CardDescription>
                  <CardTitle>
                    {isLoading ? <Skeleton className="h-8 w-24" /> : value}
                  </CardTitle>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end space-y-1.5 pt-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3.5 w-20" />
                </>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">{error}</p>
                  {onRetry ? (
                    <Button size="xs" variant="outline" onClick={onRetry}>
                      Retry
                    </Button>
                  ) : null}
                </div>
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
