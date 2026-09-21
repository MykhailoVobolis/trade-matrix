"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewMetric } from "@/lib/overview/overview-api";
import {
  formatCompactCurrency,
  formatNumber,
} from "@/lib/overview/overview-format";

export type DashboardKpiCardDefinition = {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  kind: "currency" | "number";
};

function formatMetricValue(
  kind: DashboardKpiCardDefinition["kind"],
  value: number | null | undefined,
) {
  return kind === "currency"
    ? formatCompactCurrency(value)
    : formatNumber(value);
}

function getDeltaBadge(
  metric: OverviewMetric | undefined,
  comparisonEnabled: boolean,
) {
  if (!comparisonEnabled) {
    return null;
  }

  if (!metric?.hasComparablePrevious || metric.deltaPercent === null) {
    return null;
  }

  if (metric.deltaPercent > 0) {
    return {
      label: `+${metric.deltaPercent.toFixed(1)}%`,
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }

  if (metric.deltaPercent < 0) {
    return {
      label: `${metric.deltaPercent.toFixed(1)}%`,
      className:
        "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    };
  }

  return {
    label: "0.0%",
    className: "border-border/70 bg-muted/50 text-muted-foreground",
  };
}

function getComparisonText(
  kind: DashboardKpiCardDefinition["kind"],
  metric: OverviewMetric | undefined,
  comparisonEnabled: boolean,
) {
  if (!comparisonEnabled) {
    return {
      label: "Порівняння",
      value: "Вимкнено",
    };
  }

  if (!metric?.hasComparablePrevious) {
    return {
      label: "Порівняння",
      value: "Немає даних для порівняння",
    };
  }

  return {
    label: "Попер. період",
    value: formatMetricValue(kind, metric.previous),
  };
}

function getPrintDeltaBadgeStyle(metric: OverviewMetric | undefined) {
  if (metric?.deltaPercent === null || metric?.deltaPercent === undefined) {
    return undefined;
  }

  if (metric.deltaPercent > 0) {
    return {
      color: "#059669",
      backgroundColor: "#ecfdf5",
      borderColor: "#a7f3d0",
    };
  }

  if (metric.deltaPercent < 0) {
    return {
      color: "#e11d48",
      backgroundColor: "#fff1f2",
      borderColor: "#fecdd3",
    };
  }

  return {
    color: "#71717a",
    backgroundColor: "#f5f5f5",
    borderColor: "#d4d4d8",
  };
}

function renderPrintDeltaBadge(
  label: string,
  metric: OverviewMetric | undefined,
) {
  const palette = getPrintDeltaBadgeStyle(metric);

  if (!palette) {
    return null;
  }

  const width = Math.max(42, label.length * 6 + 8);

  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      height="20"
      viewBox={`0 0 ${width} 20`}
      width={width}
    >
      <rect
        fill={palette.backgroundColor}
        height="19"
        rx="5"
        ry="5"
        stroke={palette.borderColor}
        strokeWidth="1"
        width={width - 1}
        x="0.5"
        y="0.5"
      />
      <text
        fill={palette.color}
        fontFamily="Geist, Arial, sans-serif"
        fontSize="9.5"
        fontWeight="600"
        textAnchor="middle"
        x={width / 2}
        y="10.8"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </svg>
  );
}

export function DashboardKpiGrid({
  cards,
  metrics,
  isLoading,
  error,
  comparisonEnabled = true,
  onRetry,
  printMode = false,
}: {
  cards: readonly DashboardKpiCardDefinition[];
  metrics: Array<OverviewMetric | undefined>;
  isLoading: boolean;
  error: string | null;
  comparisonEnabled?: boolean;
  onRetry?: () => void;
  printMode?: boolean;
}) {
  return (
    <div
      className={`dashboard-kpi-grid grid gap-3.5 ${printMode ? "grid-cols-4" : "md:grid-cols-2 xl:grid-cols-2"}`}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const metric = metrics[index];
        const value = formatMetricValue(card.kind, metric?.current);
        const deltaBadge = getDeltaBadge(metric, comparisonEnabled);
        const comparisonText = getComparisonText(
          card.kind,
          metric,
          comparisonEnabled,
        );

        return (
          <Card
            key={card.title}
            size="sm"
            className={
              isLoading
                ? "border border-border/70 shadow-none"
                : "flex h-full border border-border/70 shadow-none"
            }
            style={
              printMode
                ? {
                    borderColor: "#d4d4d8",
                    backgroundColor: "#ffffff",
                  }
                : undefined
            }
          >
            <CardHeader className="gap-3 pb-3">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="min-h-10">
                      <p className="min-w-0 text-[0.78rem] leading-snug text-muted-foreground">
                        {card.title}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                    style={
                      printMode
                        ? card.iconClassName.includes("cyan")
                          ? {
                              backgroundColor: "#cffafe",
                              color: "#0891b2",
                            }
                          : card.iconClassName.includes("amber")
                            ? {
                                backgroundColor: "#fef3c7",
                                color: "#d97706",
                              }
                            : card.iconClassName.includes("violet")
                              ? {
                                  backgroundColor: "#ede9fe",
                                  color: "#7c3aed",
                                }
                              : {
                                  backgroundColor: "#dbeafe",
                                  color: "#2563eb",
                                }
                        : undefined
                    }
                  >
                    <Icon className="size-4" />
                  </div>
                </div>
                <div
                  className="mt-2 flex items-center gap-2.5 pr-0"
                  style={printMode ? { alignItems: "baseline" } : undefined}
                >
                  <CardTitle className="!text-[1.26rem] font-medium leading-none sm:!text-[1.54rem]">
                    {isLoading ? <Skeleton className="h-8 w-26" /> : value}
                  </CardTitle>
                  {!isLoading && deltaBadge ? (
                    printMode ? (
                      <div
                        className="shrink-0"
                        style={{
                          alignSelf: "center",
                          transform: "translateY(6px)",
                        }}
                      >
                        {renderPrintDeltaBadge(deltaBadge.label, metric)}
                      </div>
                    ) : (
                      <span
                        className={`inline-grid h-5 shrink-0 place-items-center whitespace-nowrap rounded-sm border px-1.5 text-[10px] font-semibold leading-none ${deltaBadge.className}`}
                      >
                        <span>{deltaBadge.label}</span>
                      </span>
                    )
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent
              className={
                isLoading
                  ? "space-y-2 pt-0"
                  : "flex flex-1 flex-col justify-end space-y-1.5 pt-0"
              }
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-32 max-w-full" />
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
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {comparisonText.label}
                  </p>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {comparisonText.value}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
