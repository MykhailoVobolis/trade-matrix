import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewInsight } from "@/lib/overview/overview-api";
import { formatOverviewInsight } from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewMarketInsightsCard({
  insights,
  isLoading,
  error,
}: {
  insights: OverviewInsight[];
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Ринкові інсайти</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 border-t border-border/70 pt-3.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
            >
              <Skeleton className="h-4 w-full max-w-[280px]" />
            </div>
          ))
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : insights.length ? (
          insights.slice(0, 5).map((insight, index) => (
            <div
              key={`${insight.type}-${index}`}
              className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3 text-sm text-foreground"
            >
              {formatOverviewInsight(insight)}
            </div>
          ))
        ) : (
          <div className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3 text-sm text-muted-foreground">
            No insights available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
