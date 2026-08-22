import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewMarketInsightsCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle>Ринкові інсайти</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 border-t border-border/70 pt-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/70 bg-muted/10 px-4 py-3"
          >
            <Skeleton className="h-4 w-full max-w-[280px]" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
