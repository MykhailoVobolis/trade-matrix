import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewTrendCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Продажі та закупівлі за період</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <span>Групування</span>
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <span>Сума</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary" />
            Продажі з ПДВ
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary/25" />
            Закупівлі з ПДВ
          </div>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-muted-foreground/60" />
            Попер. період
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/15 p-4">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
