import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewTimeGrain } from "@/lib/overview/overview-url-state";

const timeGrainOptions: Array<{
  value: OverviewTimeGrain;
  label: string;
}> = [
  { value: "DAY", label: "День" },
  { value: "WEEK", label: "Тиждень" },
  { value: "MONTH", label: "Місяць" },
  { value: "QUARTER", label: "Квартал" },
];

export function OverviewTrendCard({
  timeGrain,
  onTimeGrainChange,
}: {
  timeGrain: OverviewTimeGrain | "";
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
}) {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Продажі та закупівлі за період</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={timeGrain || "__AUTO__"}
            onValueChange={(value) =>
              onTimeGrainChange(
                value === "__AUTO__" ? "" : (value as OverviewTimeGrain),
              )
            }
          >
            <SelectTrigger className="h-9 min-w-36 rounded-md">
              <SelectValue placeholder="Групування" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__AUTO__">Авто</SelectItem>
              {timeGrainOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <span>Сума</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
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

        <div className="rounded-md border border-border/70 bg-muted/15 p-4">
          <Skeleton className="h-[320px] w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
