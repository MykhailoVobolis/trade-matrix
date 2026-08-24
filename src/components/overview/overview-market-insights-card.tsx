import {
  BarChart3Icon,
  Building2Icon,
  MapPinnedIcon,
  PackageIcon,
  TagIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewInsight } from "@/lib/overview/overview-api";
import { formatOverviewInsight } from "@/lib/overview/overview-format";

function isRenderableInsight(insight: OverviewInsight) {
  if (
    insight.type === "BUYER_CONCENTRATION" ||
    insight.type === "PRODUCT_CONCENTRATION" ||
    insight.type === "REGION_CONCENTRATION" ||
    insight.type === "PURCHASES_CHANGE" ||
    insight.type === "PEAK_PURCHASES_PERIOD"
  ) {
    return false;
  }

  return true;
}

function getInsightIcon(type: OverviewInsight["type"]) {
  switch (type) {
    case "SALES_CHANGE":
    case "PEAK_SALES_PERIOD":
      return {
        icon: TrendingUpIcon,
        className: "bg-sidebar-primary/10 text-sidebar-primary",
      };
    case "PURCHASES_CHANGE":
    case "PEAK_PURCHASES_PERIOD":
      return {
        icon: TrendingDownIcon,
        className: "bg-sky-500/10 text-sky-600",
      };
    case "BUYER_CONCENTRATION":
      return {
        icon: UsersIcon,
        className: "bg-blue-500/10 text-blue-600",
      };
    case "PRODUCT_CONCENTRATION":
      return {
        icon: PackageIcon,
        className: "bg-violet-500/10 text-violet-600",
      };
    case "REGION_CONCENTRATION":
      return {
        icon: MapPinnedIcon,
        className: "bg-amber-500/10 text-amber-600",
      };
    case "SUPPLIER_CONCENTRATION":
      return {
        icon: Building2Icon,
        className: "bg-cyan-500/10 text-cyan-600",
      };
    case "TOP_REGION":
      return {
        icon: MapPinnedIcon,
        className: "bg-amber-500/10 text-amber-600",
      };
    case "TOP_UKTZED":
      return {
        icon: TagIcon,
        className: "bg-violet-500/10 text-violet-600",
      };
    default:
      return {
        icon: BarChart3Icon,
        className: "bg-muted text-foreground",
      };
  }
}

function isPlaceholderInsight(insight: OverviewInsight) {
  const payload = insight.payload;

  switch (insight.type) {
    case "SALES_CHANGE":
      return payload.deltaPercent == null;
    case "PEAK_SALES_PERIOD": {
      const amount = payload.amount;
      const numericAmount =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? Number(amount)
            : NaN;

      return !(Number.isFinite(numericAmount) && numericAmount > 0);
    }
    case "SUPPLIER_CONCENTRATION":
      return payload.top5Share == null;
    case "TOP_REGION":
      return !payload.regionName || payload.regionName === "—";
    case "TOP_UKTZED":
      return payload.code == null || payload.share == null;
    default:
      return false;
  }
}

export function OverviewMarketInsightsCard({
  insights,
  isLoading,
  error,
  onRetry,
  renderEmptyAsGrid = false,
  emptyGridCount = 3,
  emptyGridTemplates,
  emptyGridTypes,
}: {
  insights: OverviewInsight[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  renderEmptyAsGrid?: boolean;
  emptyGridCount?: number;
  emptyGridTemplates?: string[];
  emptyGridTypes?: OverviewInsight["type"][];
}) {
  const visibleInsights = insights.filter(isRenderableInsight);

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Ринкові інсайти</CardTitle>
      </CardHeader>
      <CardContent className="border-t border-border/70 pt-3.5">
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 size-10 rounded-md" />
                  <Skeleton className="h-4 w-full max-w-[280px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            <p>{error}</p>
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : visibleInsights.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleInsights.slice(0, 6).map((insight, index) => {
              const { icon: InsightIcon, className } = getInsightIcon(
                insight.type,
              );
              const isPlaceholder = isPlaceholderInsight(insight);

              return (
                <div
                  key={`${insight.type}-${index}`}
                  className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-md ${className}`}
                    >
                      <InsightIcon className="size-4" />
                    </div>
                    <p
                      className={`text-sm leading-6 ${
                        isPlaceholder
                          ? "text-muted-foreground/80"
                          : "text-foreground"
                      }`}
                    >
                      {formatOverviewInsight(insight)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : renderEmptyAsGrid ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(emptyGridTemplates?.length
              ? emptyGridTemplates
              : Array.from({ length: emptyGridCount }, () => "")
            ).map((template, index) => {
              const insightType = emptyGridTypes?.[index];
              const { icon: EmptyInsightIcon, className } = getInsightIcon(
                insightType ?? "SALES_CHANGE",
              );

              return (
                <div
                  key={`empty-insight-${index}`}
                  className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-md ${className}`}
                    >
                      <EmptyInsightIcon className="size-4" />
                    </div>
                    {template ? (
                      <p className="text-sm leading-6 text-muted-foreground/80">
                        {template}
                      </p>
                    ) : (
                      <div className="space-y-2 pt-0.5">
                        <div className="h-3.5 w-40 rounded bg-muted/60" />
                        <div className="h-3.5 w-28 rounded bg-muted/45" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3 text-sm text-muted-foreground">
            Немає ринкових інсайтів
          </div>
        )}
      </CardContent>
    </Card>
  );
}
