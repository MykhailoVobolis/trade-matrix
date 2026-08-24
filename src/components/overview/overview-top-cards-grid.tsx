import Link from "next/link";
import {
  Building2Icon,
  MapPinnedIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";

import { OverflowTooltipText } from "@/components/overview/overflow-tooltip-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  OverviewProductRankingItem,
  OverviewRankingItem,
  OverviewRegionRankingItem,
} from "@/lib/overview/overview-api";
import { buildOverviewDrilldownHref } from "@/lib/overview/overview-drilldown";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";
import {
  formatCompactCurrency,
  formatPercent,
} from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";

const topCards = [
  {
    title: "Топ покупців",
    columns: ["Покупець", "Продажі з ПДВ", "Частка"],
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Топ постачальників",
    columns: ["Постачальник", "Закупівлі з ПДВ", "Частка"],
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Топ продуктів",
    columns: ["Продукт / Номенклатура", "Продажі з ПДВ", "Частка"],
    icon: PackageIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Топ регіонів збуту",
    columns: ["Регіон покупця", "Продажі з ПДВ", "Частка"],
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

export function OverviewTopCardsGrid({
  state,
  topBuyers,
  topSuppliers,
  topProducts,
  topRegions,
  isLoading,
  error,
  onRetry,
}: {
  state: OverviewFilterState;
  topBuyers: OverviewRankingItem[];
  topSuppliers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const rows = [topBuyers, topSuppliers, topProducts, topRegions];
  const gridClassName =
    "grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)]";
  const cardLinks = [
    buildOverviewDrilldownHref({
      state,
      target: "buyers",
    }),
    buildOverviewDrilldownHref({
      state,
      target: "suppliers",
    }),
    buildOverviewDrilldownHref({
      state,
      target: "products",
    }),
    buildOverviewDrilldownHref({
      state,
      target: "regions",
    }),
  ] as const;

  return (
    <div className="grid gap-4">
      {topCards.map((card, cardIndex) => (
        <Card key={card.title} className="border border-border/70 shadow-none">
          <CardHeader className="gap-3 border-b border-border/70 pb-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <card.icon className="size-4" />
                </span>
                <CardTitle className="text-[1.05rem]">{card.title}</CardTitle>
              </div>
              <Link
                href={cardLinks[cardIndex]}
                className="text-xs font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
              >
                Переглянути всі
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-3.5">
            <div
              className={`grid ${gridClassName} gap-4 px-1 text-[11px] font-medium text-muted-foreground`}
            >
              {card.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`grid ${gridClassName} items-center gap-4 border-b border-border/60 px-1 py-2 last:border-b-0`}
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{error}</p>
                {onRetry ? (
                  <Button size="sm" variant="outline" onClick={onRetry}>
                    Retry
                  </Button>
                ) : null}
              </div>
            ) : rows[cardIndex].length ? (
              rows[cardIndex].slice(0, 5).map((item, index) => {
                const href =
                  cardIndex === 0
                    ? buildOverviewDrilldownHref({
                        state,
                        target: "buyers",
                        buyerTaxNumbers:
                          "id" in item && typeof item.id === "string"
                            ? [item.id]
                            : undefined,
                      })
                    : cardIndex === 1
                      ? buildOverviewDrilldownHref({
                          state,
                          target: "suppliers",
                          supplierTaxNumbers:
                            "id" in item && typeof item.id === "string"
                              ? [item.id]
                              : undefined,
                        })
                      : cardIndex === 2
                        ? buildOverviewDrilldownHref({
                            state,
                            target: "products",
                            products: "name" in item ? [item.name] : undefined,
                          })
                        : buildOverviewDrilldownHref({
                            state,
                            target: "regions",
                            buyerRegionCodes:
                              "regionCode" in item &&
                              typeof item.regionCode === "string"
                                ? [item.regionCode]
                                : undefined,
                          });
                const name = "regionName" in item ? item.regionName : item.name;
                const secondaryText =
                  cardIndex === 2 && "uktzed" in item && item.uktzed
                    ? `УКТЗЕД ${item.uktzed}`
                    : cardIndex === 3 &&
                        "activeBuyers" in item &&
                        typeof item.activeBuyers === "number"
                      ? `${item.activeBuyers} активних покупців`
                      : null;

                return (
                  <Link
                    href={href}
                    key={`${card.title}-${index}`}
                    className={`grid ${gridClassName} items-center gap-4 rounded-md border-b border-border/60 px-1 py-2 transition-colors hover:bg-sidebar-accent/45 last:border-b-0`}
                  >
                    <span className="min-w-0">
                      <OverflowTooltipText
                        text={name}
                        className="block whitespace-normal break-words text-sm leading-snug text-foreground"
                      />
                      {secondaryText ? (
                        <OverflowTooltipText
                          text={secondaryText}
                          className="mt-0.5 block whitespace-normal break-words text-[11px] leading-snug text-muted-foreground"
                        />
                      ) : null}
                    </span>
                    <span className="whitespace-nowrap text-sm text-foreground">
                      {formatCompactCurrency(item.amount)}
                    </span>
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatPercent(item.share)}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No ranking data</p>
            )}
            <div
              className={`grid ${gridClassName} items-center gap-4 border-t border-border/70 px-1 pt-2.5 text-sm`}
            >
              <span className="whitespace-nowrap font-semibold text-foreground">
                Разом TOP-5
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatCompactCurrency(
                  rows[cardIndex]
                    .slice(0, 5)
                    .reduce((total, item) => total + item.amount, 0),
                )}
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatPercent(
                  rows[cardIndex]
                    .slice(0, 5)
                    .reduce((total, item) => total + item.share, 0),
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
