import type { ReactNode } from "react";
import {
  CalendarRangeIcon,
  DownloadIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const primaryFilters = [
  "UKTZED",
  "Продукт / Номенклатура",
  "Регіон покупця",
  "Покупець",
  "Постачальник",
] as const;

function FilterShell({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex h-11 items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm shadow-black/[0.02]">
        <div className="flex items-center gap-2">
          {icon}
          <Skeleton className="h-4 w-24" />
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function ComparisonShell() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Порівняти з</p>
      <div className="flex h-11 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 text-sm shadow-sm shadow-black/[0.02]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground">:</span>
          <div className="flex flex-1 items-center justify-between gap-3">
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function OverviewFilters() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,320px)_minmax(260px,360px)] xl:flex xl:flex-wrap xl:items-center">
          <FilterShell
            label="Період"
            icon={
              <CalendarRangeIcon className="size-4 text-muted-foreground" />
            }
          />
          <ComparisonShell />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="px-3 shadow-sm shadow-black/[0.02]"
            disabled
          >
            Очистити фільтри
          </Button>
          <Button className="px-3 shadow-sm shadow-black/[0.02]" disabled>
            <DownloadIcon />
            Експорт
          </Button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[repeat(5,minmax(150px,1fr))_minmax(156px,0.95fr)]">
        {primaryFilters.map((filterName) => (
          <FilterShell key={filterName} label={filterName} />
        ))}

        <FilterShell
          label="Більше фільтрів"
          icon={
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          }
        />
      </div>
    </div>
  );
}
