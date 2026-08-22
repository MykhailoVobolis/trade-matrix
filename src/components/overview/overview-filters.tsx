import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarRangeIcon, ChevronDownIcon, DownloadIcon } from "lucide-react";

import { OverviewSearchableMultiSelect } from "@/components/overview/overview-searchable-multi-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type {
  OverviewFilterState,
  OverviewFilterValues,
} from "@/lib/overview/overview-url-state";
import { useOverviewFilterOptionsInfiniteQuery } from "@/lib/overview/overview-query";

const primaryFilters = [
  {
    key: "uktzed",
    label: "UKTZED",
    placeholder: "All UKTZED",
    dimension: "uktzed",
  },
  {
    key: "products",
    label: "Product / Nomenclature",
    placeholder: "All products",
    dimension: "products",
  },
  {
    key: "buyerRegionCodes",
    label: "Buyer Region",
    placeholder: "All regions",
    dimension: "buyerRegions",
  },
  {
    key: "buyerTaxNumbers",
    label: "Buyer",
    placeholder: "All buyers",
    dimension: "buyers",
  },
  {
    key: "supplierTaxNumbers",
    label: "Supplier",
    placeholder: "All suppliers",
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

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function useDebouncedValue<T>(value: T, delayMs = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
}

function DateRangeFilter({
  label,
  dateFrom,
  dateTo,
  onChange,
}: {
  label: string;
  dateFrom: string;
  dateTo: string;
  onChange: (next: { dateFrom: string; dateTo: string }) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Popover modal={false}>
          <PopoverTrigger className="block w-full text-left">
            <span className="block">
              <span className="flex h-11 items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm shadow-black/[0.02]">
                <span className="flex min-w-0 items-center gap-2">
                  <CalendarRangeIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{formatDateLabel(dateFrom)}</span>
                </span>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </span>
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={dateFrom ? new Date(dateFrom) : undefined}
              endMonth={new Date("2035-12-31")}
              startMonth={new Date("2020-01-01")}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                const nextDateFrom = toIsoDate(date);
                onChange({
                  dateFrom: nextDateFrom,
                  dateTo: nextDateFrom > dateTo ? nextDateFrom : dateTo,
                });
              }}
              className="rounded-lg border"
            />
          </PopoverContent>
        </Popover>

        <Popover modal={false}>
          <PopoverTrigger className="block w-full text-left">
            <span className="block">
              <span className="flex h-11 items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm shadow-black/[0.02]">
                <span className="flex min-w-0 items-center gap-2">
                  <CalendarRangeIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{formatDateLabel(dateTo)}</span>
                </span>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </span>
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={dateTo ? new Date(dateTo) : undefined}
              endMonth={new Date("2035-12-31")}
              startMonth={new Date("2020-01-01")}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                const nextDateTo = toIsoDate(date);
                onChange({
                  dateFrom: nextDateTo < dateFrom ? nextDateTo : dateFrom,
                  dateTo: nextDateTo,
                });
              }}
              className="rounded-lg border"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function SearchableFilterField({
  filterKey,
  label,
  placeholder,
  dimension,
  state,
  accessToken,
  onUpdateOverviewFilters,
}: {
  filterKey: keyof Pick<
    OverviewFilterState,
    | "uktzed"
    | "products"
    | "buyerRegionCodes"
    | "buyerTaxNumbers"
    | "supplierTaxNumbers"
  >;
  label: string;
  placeholder: string;
  dimension: "buyers" | "suppliers" | "products" | "uktzed" | "buyerRegions";
  state: OverviewFilterState;
  accessToken: string | null;
  onUpdateOverviewFilters: (patch: Partial<OverviewFilterValues>) => void;
}) {
  const selectedValues = state[filterKey];
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebouncedValue(searchValue, 350);
  const optionsState = useMemo(
    () => ({
      ...state,
      [filterKey]: [],
    }),
    [filterKey, state],
  );
  const optionsQuery = useOverviewFilterOptionsInfiniteQuery({
    state: optionsState,
    dimension,
    search: debouncedSearchValue,
    limit: 50,
    accessToken,
    enabled: true,
  });

  const optionItems = useMemo(
    () => optionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [optionsQuery.data?.pages],
  );

  const selectedLabels = useMemo(() => {
    const labels: Record<string, string> = {};

    optionItems.forEach((item) => {
      if (selectedValues.includes(item.value)) {
        labels[item.value] = item.label;
      }
    });

    return labels;
  }, [optionItems, selectedValues]);

  const handleChange = useCallback(
    (values: string[]) => {
      onUpdateOverviewFilters({
        [filterKey]: values,
      } as Partial<OverviewFilterValues>);
    },
    [filterKey, onUpdateOverviewFilters],
  );

  return (
    <OverviewSearchableMultiSelect
      label={label}
      placeholder={placeholder}
      selectedValues={selectedValues}
      selectedLabels={selectedLabels}
      options={optionItems}
      isLoading={optionsQuery.isLoading}
      isError={Boolean(optionsQuery.error)}
      errorMessage={optionsQuery.error?.message}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onChange={handleChange}
      hasMore={optionsQuery.hasNextPage}
      isLoadingMore={optionsQuery.isFetchingNextPage}
      onLoadMore={() => {
        void optionsQuery.fetchNextPage();
      }}
    />
  );
}

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
        <div className="grid gap-3 md:grid-cols-[minmax(240px,320px)_minmax(260px,360px)] xl:flex xl:flex-wrap xl:items-start">
          <DateRangeFilter
            label="Period"
            dateFrom={state.dateFrom}
            dateTo={state.dateTo}
            onChange={({ dateFrom, dateTo }) =>
              onUpdateOverviewFilters({
                dateFrom,
                dateTo,
              })
            }
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Comparison Period
            </p>
            <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm shadow-black/[0.02]">
              <div className="space-y-0.5">
                <p className="text-sm text-foreground">
                  Same selected period, previous year
                </p>
              </div>
              <Switch
                checked={state.comparisonMode === "PREVIOUS_PERIOD"}
                onCheckedChange={(checked) =>
                  onUpdateOverviewFilters({
                    comparisonMode: checked ? "PREVIOUS_PERIOD" : "NONE",
                    compareDateFrom: "",
                    compareDateTo: "",
                  })
                }
              />
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

      <div className="grid gap-2.5 xl:grid-cols-5">
        {primaryFilters.map((filter) => (
          <SearchableFilterField
            key={filter.key}
            filterKey={filter.key}
            label={filter.label}
            placeholder={filter.placeholder}
            dimension={filter.dimension}
            state={state}
            accessToken={accessToken}
            onUpdateOverviewFilters={onUpdateOverviewFilters}
          />
        ))}
      </div>
    </div>
  );
}
