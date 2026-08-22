import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const structureItems = [
  "Топ покупець",
  "Топ постачальник",
  "Топ регіон збуту",
  "Топ UKTZED",
  "Частка TOP-5 покупців",
  "Частка TOP-5 постачальників",
] as const;

export function OverviewMarketStructureCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle>Структура ринку</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 border-t border-border/70 pt-4">
        {structureItems.map((item) => (
          <div
            key={item}
            className="rounded-lg border border-border/70 bg-muted/10 px-4 py-3"
          >
            <p className="text-xs font-medium text-muted-foreground">{item}</p>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
