import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  OverviewProductRankingItem,
  OverviewRankingItem,
  OverviewRegionRankingItem,
} from "@/lib/overview/overview-api";
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
  topBuyers,
  topSuppliers,
  topProducts,
  topRegions,
  isLoading,
  error,
}: {
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

  return (
    <div className="grid gap-4">
      {topCards.map((card, cardIndex) => (
        <Card key={card.title} className="border border-border/70 shadow-none">
          <CardHeader className="gap-3 border-b border-border/70 pb-3.5">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-[1.05rem]">{card.title}</CardTitle>
              <span className="text-xs font-medium text-sidebar-primary">
                Переглянути всі
              </span>
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
              rows[cardIndex].slice(0, 5).map((item, index) => (
                <div
                  key={`${card.title}-${index}`}
                  className={`grid ${gridClassName} items-center gap-4 border-b border-border/60 px-1 py-2 last:border-b-0`}
                >
                  <span className="truncate text-sm text-foreground">
                    {"regionName" in item ? item.regionName : item.name}
                  </span>
                  <span className="whitespace-nowrap text-sm text-foreground">
                    {formatCompactCurrency(item.amount)}
                  </span>
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatPercent(item.share)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No ranking data</p>
            )}
            <div
              className={`grid ${gridClassName} items-center gap-4 border-t border-border/70 px-1 pt-2.5 text-xs`}
            >
              <span className="whitespace-nowrap font-medium text-foreground">
                Разом TOP-5
              </span>
              <span className="text-foreground">—</span>
              <span className="text-muted-foreground">—</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
