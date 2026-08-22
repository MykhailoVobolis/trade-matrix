import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewMarketStructure } from "@/lib/overview/overview-api";
import {
  formatCompactCurrency,
  formatPercent,
} from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";

const structureItems = [
  "Топ покупець",
  "Топ постачальник",
  "Топ регіон збуту",
  "Топ UKTZED",
  "Частка TOP-5 покупців",
  "Частка TOP-5 постачальників",
] as const;

export function OverviewMarketStructureCard({
  data,
  isLoading,
  error,
}: {
  data?: OverviewMarketStructure;
  isLoading: boolean;
  error: string | null;
}) {
  const values = data
    ? [
        data.topBuyer
          ? `${data.topBuyer.name} • ${formatCompactCurrency(data.topBuyer.amount)}`
          : null,
        data.topSupplier
          ? `${data.topSupplier.name} • ${formatCompactCurrency(data.topSupplier.amount)}`
          : null,
        data.topBuyerRegion
          ? `${data.topBuyerRegion.name} • ${formatCompactCurrency(data.topBuyerRegion.amount)}`
          : null,
        data.topUKTZED
          ? `${data.topUKTZED.code ?? data.topUKTZED.name} • ${formatCompactCurrency(data.topUKTZED.amount)}`
          : null,
        data.top5BuyersShare !== null
          ? `${formatPercent(data.top5BuyersShare)} від продажів`
          : null,
        data.top5SuppliersShare !== null
          ? `${formatPercent(data.top5SuppliersShare)} від закупівель`
          : null,
      ]
    : [];

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Структура ринку</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 border-t border-border/70 pt-3.5">
        {structureItems.map((item) => (
          <div
            key={item}
            className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
          >
            <p className="text-xs font-medium text-muted-foreground">{item}</p>
            <div className="mt-2 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </>
              ) : error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : (
                <p className="text-sm text-foreground">
                  {values[structureItems.indexOf(item)] ?? "—"}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
