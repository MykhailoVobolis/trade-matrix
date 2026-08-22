import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function OverviewTopCardsGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {topCards.map((card) => (
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
            <div className="grid grid-cols-[minmax(0,1.35fr)_0.9fr_0.6fr] gap-3 px-1 text-[11px] font-medium text-muted-foreground">
              {card.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1.35fr)_0.9fr_0.6fr] items-center gap-3 border-b border-border/60 px-1 py-2 last:border-b-0"
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
            <div className="grid grid-cols-[minmax(0,1.35fr)_0.9fr_0.6fr] items-center gap-3 border-t border-border/70 px-1 pt-2.5 text-xs">
              <span className="whitespace-nowrap font-medium text-foreground">
                Разом TOP-5
              </span>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
