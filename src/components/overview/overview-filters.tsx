import { useDeferredValue, useState, type ReactNode } from "react";
import {
  CalendarRangeIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OverviewFilterOptionsDimension } from "@/lib/overview/overview-api";
import { useOverviewFilterOptionsQuery } from "@/lib/overview/overview-query";
import type {
  OverviewComparisonMode,
  OverviewFilterState,
  OverviewFilterValues,
} from "@/lib/overview/overview-url-state";
import { cn } from "@/lib/utils";

const primaryFilters = [
  {
    key: "uktzed",
    label: "UKTZED",
    placeholder: "Наприклад: 2710, 1001",
    dimension: "uktzed",
  },
  {
    key: "products",
    label: "Продукт / Номенклатура",
    placeholder: "Наприклад: ДП, Бензин",
    dimension: "products",
  },
  {
    key: "buyerRegionCodes",
    label: "Регіон покупця",
    placeholder: "Наприклад: 32, 80",
    dimension: "buyerRegions",
  },
  {
    key: "buyerTaxNumbers",
    label: "Покупець",
    placeholder: "Наприклад: 38333525, 0",
    dimension: "buyers",
  },
  {
    key: "supplierTaxNumbers",
    label: "Постачальник",
    placeholder: "Наприклад: 41784512, 0",
    dimension: "suppliers",
  },
] as const;

function formatDateLabel(value: string) {
  if (!value) {
    return "Select date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatFilterSummary(values: string[]) {
  if (values.length === 0) {
    return "All";
  }

  if (values.length === 1) {
    return values[0];
  }

  return `${values.length} selected`;
}

function FilterShell({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex h-11 items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm shadow-black/[0.02]">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate">{value}</span>
        </div>
        {children ?? (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function MultiValueFilterPopover({
  label,
  value,
  values,
  placeholder,
  dimension,
  filterState,
  accessToken,
  onApply,
}: {
  label: string;
  value: string;
  values: string[];
  placeholder: string;
  dimension: OverviewFilterOptionsDimension;
  filterState: OverviewFilterState;
  accessToken: string | null;
  onApply: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(values.join(", "));
  const deferredDraft = useDeferredValue(draft);
  const optionsQuery = useOverviewFilterOptionsQuery({
    state: filterState,
    dimension,
    search: deferredDraft,
    page: 1,
    limit: 8,
    accessToken,
    enabled: isOpen,
  });

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setDraft(values.join(", "));
        }
      }}
    >
      <PopoverTrigger className="block text-left">
        <span className="block">
          <FilterShell label={label} value={value}>
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
          </FilterShell>
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3 p-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            Значення зберігаються по `value`, а options already scoped current
            filters.
          </p>
        </div>
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
        />
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Suggested options
          </p>
          <div className="flex flex-wrap gap-2">
            {optionsQuery.isLoading ? (
              <span className="text-xs text-muted-foreground">Loading...</span>
            ) : optionsQuery.error ? (
              <span className="text-xs text-destructive">
                {optionsQuery.error.message}
              </span>
            ) : optionsQuery.data?.items.length ? (
              optionsQuery.data.items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs transition-colors hover:border-sidebar-primary/50 hover:text-foreground",
                    values.includes(item.value) &&
                      "border-sidebar-primary text-foreground",
                  )}
                  onClick={() => {
                    const nextValues = values.includes(item.value)
                      ? values.filter(
                          (currentValue) => currentValue !== item.value,
                        )
                      : [...values, item.value];
                    setDraft(nextValues.join(", "));
                    onApply(nextValues);
                  }}
                >
                  {item.label}
                </button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No options found.
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft("");
              onApply([]);
            }}
          >
            <XIcon />
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(
                draft
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              );
            }}
          >
            <CheckIcon />
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const comparisonModeLabels: Record<OverviewComparisonMode, string> = {
  NONE: "Без порівняння",
  PREVIOUS_PERIOD: "Попередній період",
  CUSTOM: "Кастомний період",
};

export function OverviewFilters({
  state,
  accessToken,
  onUpdateOverviewFilters,
  onResetFilters,
  onExport,
  isExportPending,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  onUpdateOverviewFilters: (patch: Partial<OverviewFilterValues>) => void;
  onResetFilters: () => void;
  onExport: () => void;
  isExportPending: boolean;
}) {
  const hasOverviewFilters =
    state.comparisonMode !== "PREVIOUS_PERIOD" ||
    state.compareDateFrom.length > 0 ||
    state.compareDateTo.length > 0 ||
    state.uktzed.length > 0 ||
    state.products.length > 0 ||
    state.buyerRegionCodes.length > 0 ||
    state.buyerTaxNumbers.length > 0 ||
    state.supplierTaxNumbers.length > 0 ||
    state.timeGrain.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,320px)_minmax(260px,360px)] xl:flex xl:flex-wrap xl:items-start">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Період</p>
            <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm shadow-black/[0.02] md:flex-row md:items-center">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CalendarRangeIcon className="size-4 text-muted-foreground" />
                <span>{formatDateLabel(state.dateFrom)}</span>
                <span className="text-muted-foreground">—</span>
                <span>{formatDateLabel(state.dateTo)}</span>
              </div>
              <div className="grid flex-1 gap-2 md:grid-cols-2">
                <Input
                  type="date"
                  value={state.dateFrom}
                  max={state.dateTo}
                  onChange={(event) =>
                    onUpdateOverviewFilters({ dateFrom: event.target.value })
                  }
                  className="h-9 rounded-md"
                />
                <Input
                  type="date"
                  value={state.dateTo}
                  min={state.dateFrom}
                  onChange={(event) =>
                    onUpdateOverviewFilters({ dateTo: event.target.value })
                  }
                  className="h-9 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Порівняти з
            </p>
            <div className="grid gap-2 rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm shadow-black/[0.02]">
              <Select
                value={state.comparisonMode}
                onValueChange={(value) =>
                  onUpdateOverviewFilters({
                    comparisonMode: value as OverviewComparisonMode,
                    compareDateFrom:
                      value === "CUSTOM" ? state.compareDateFrom : "",
                    compareDateTo:
                      value === "CUSTOM" ? state.compareDateTo : "",
                  })
                }
              >
                <SelectTrigger className="h-9 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(comparisonModeLabels).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {state.comparisonMode === "CUSTOM" ? (
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    type="date"
                    value={state.compareDateFrom}
                    max={state.compareDateTo || undefined}
                    onChange={(event) =>
                      onUpdateOverviewFilters({
                        compareDateFrom: event.target.value,
                      })
                    }
                    className="h-9 rounded-md"
                  />
                  <Input
                    type="date"
                    value={state.compareDateTo}
                    min={state.compareDateFrom || undefined}
                    onChange={(event) =>
                      onUpdateOverviewFilters({
                        compareDateTo: event.target.value,
                      })
                    }
                    className="h-9 rounded-md"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {comparisonModeLabels[state.comparisonMode]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="px-3 shadow-sm shadow-black/[0.02]"
            disabled={!hasOverviewFilters}
            onClick={onResetFilters}
          >
            Очистити фільтри
          </Button>
          <Button
            className="px-3 shadow-sm shadow-black/[0.02]"
            disabled={!accessToken || isExportPending}
            onClick={onExport}
          >
            <DownloadIcon />
            {isExportPending ? "Exporting..." : "Експорт"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[repeat(5,minmax(150px,1fr))_minmax(156px,0.95fr)]">
        {primaryFilters.map((filter) => (
          <MultiValueFilterPopover
            key={filter.key}
            label={filter.label}
            value={formatFilterSummary(state[filter.key])}
            values={state[filter.key]}
            placeholder={filter.placeholder}
            dimension={filter.dimension}
            filterState={state}
            accessToken={accessToken}
            onApply={(values) =>
              onUpdateOverviewFilters({
                [filter.key]: values,
              } as Partial<OverviewFilterValues>)
            }
          />
        ))}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Більше фільтрів
          </p>
          <div className="flex h-11 items-center justify-between gap-2 rounded-lg border border-dashed border-border/70 bg-background px-3 text-sm text-muted-foreground shadow-sm shadow-black/[0.02]">
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontalIcon className="size-4" />
              <span>Pending next commit</span>
            </div>
            <ChevronDownIcon className="size-4" />
          </div>
        </div>
      </div>

      {state.timeGrain ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Time grain:</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1",
            )}
          >
            {state.timeGrain}
          </span>
        </div>
      ) : null}
    </div>
  );
}
