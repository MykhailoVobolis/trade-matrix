import {
  BriefcaseBusinessIcon,
  MapPinnedIcon,
  TagIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewMarketStructure } from "@/lib/overview/overview-api";
import {
  formatCompactCurrency,
  formatPercent,
} from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";

const structureItems = [
  {
    title: "Топ постачальник",
    icon: BriefcaseBusinessIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Топ покупець",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Топ регіон збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Частка TOP-5 постачальників",
    icon: TrophyIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Частка TOP-5 покупців",
    icon: TrophyIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Топ УКТЗЕД",
    icon: TagIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
] as const;

export function OverviewMarketStructureCard({
  data,
  isLoading,
  error,
  onRetry,
}: {
  data?: OverviewMarketStructure;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const values = data
    ? [
        data.topSupplier
          ? {
              primary: data.topSupplier.name,
              secondary: `${formatCompactCurrency(data.topSupplier.amount)} • ${formatPercent(data.topSupplier.share)}`,
              tertiary:
                typeof data.topSupplier.id === "string" &&
                data.topSupplier.id.trim()
                  ? `ЄДРПОУ ${data.topSupplier.id}`
                  : null,
            }
          : null,
        data.topBuyer
          ? {
              primary: data.topBuyer.name,
              secondary: `${formatCompactCurrency(data.topBuyer.amount)} • ${formatPercent(data.topBuyer.share)}`,
              tertiary:
                typeof data.topBuyer.id === "string" && data.topBuyer.id.trim()
                  ? `ЄДРПОУ ${data.topBuyer.id}`
                  : null,
            }
          : null,
        data.topBuyerRegion
          ? {
              primary:
                data.topBuyerRegion.regionName &&
                data.topBuyerRegion.regionName.trim() !== "undefined"
                  ? data.topBuyerRegion.regionName
                  : "Не визначено",
              secondary: `${formatCompactCurrency(data.topBuyerRegion.amount)} • ${formatPercent(data.topBuyerRegion.share)}`,
            }
          : null,
        data.top5SuppliersShare !== null
          ? {
              primary: `${formatPercent(data.top5SuppliersShare)} від закупівель`,
            }
          : null,
        data.top5BuyersShare !== null
          ? {
              primary: `${formatPercent(data.top5BuyersShare)} від продажів`,
            }
          : null,
        data.topUKTZED
          ? {
              primary: data.topUKTZED.code ?? data.topUKTZED.name,
              secondary: `${formatCompactCurrency(data.topUKTZED.amount)} • ${formatPercent(data.topUKTZED.share)}`,
              tertiary: data.topUKTZED.description ?? null,
            }
          : null,
      ]
    : [];

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Структура ринку</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-border/70 pt-3.5 md:grid-cols-2 xl:grid-cols-3">
        {structureItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="max-w-[calc(100%-3.5rem)] text-xs font-medium text-muted-foreground">
                  {item.title}
                </p>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
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
                  (() => {
                    const value = values[index];

                    if (!value) {
                      return <p className="text-sm text-foreground">—</p>;
                    }

                    return (
                      <div className="max-w-[calc(100%-3.5rem)]">
                        <p className="break-words text-sm text-foreground">
                          {value.primary}
                        </p>
                        {"tertiary" in value && value.tertiary ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {value.tertiary}
                          </p>
                        ) : null}
                        {"secondary" in value && value.secondary ? (
                          <p
                            className={`text-xs text-muted-foreground ${
                              "tertiary" in value && value.tertiary
                                ? "mt-2"
                                : "mt-0.5"
                            }`}
                          >
                            {value.secondary}
                          </p>
                        ) : null}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
