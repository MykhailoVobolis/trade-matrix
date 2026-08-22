import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    title: "Top Buyers",
    columns: ["Покупець", "Продажі з ПДВ", "Частка"],
  },
  {
    title: "Top Suppliers",
    columns: ["Постачальник", "Закупівлі з ПДВ", "Частка"],
  },
  {
    title: "Top Products",
    columns: ["Продукт / Номенклатура", "Продажі з ПДВ", "Частка"],
  },
  {
    title: "Top Regions",
    columns: ["Регіон покупця", "Продажі з ПДВ", "Частка"],
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
}: {
  state: OverviewFilterState;
  topBuyers: OverviewRankingItem[];
  topSuppliers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  isLoading: boolean;
  error: string | null;
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
              <CardTitle className="text-[1.05rem]">{card.title}</CardTitle>
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
              <p className="text-sm text-destructive">{error}</p>
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
                    ? `UKTZED ${item.uktzed}`
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
                      <span className="block truncate text-sm text-foreground">
                        {name}
                      </span>
                      {secondaryText ? (
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {secondaryText}
                        </span>
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
