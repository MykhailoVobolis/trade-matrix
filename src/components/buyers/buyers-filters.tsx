"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarRangeIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
} from "lucide-react";

import { OverviewSearchableMultiSelect } from "@/components/overview/overview-searchable-multi-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { OverviewExportFormat } from "@/lib/overview/overview-api";
import type {
  OverviewFilterState,
  OverviewFilterValues,
} from "@/lib/overview/overview-url-state";
import { useBuyersFilterOptionsInfiniteQuery } from "@/lib/buyers/buyers-query";

type FilterDimension =
  "buyers" | "suppliers" | "products" | "uktzed" | "buyerRegions";

const dependentFilters = [
  {
    key: "supplierTaxNumbers",
    label: "Постачальник",
    placeholder: "Усі постачальники",
    dimension: "suppliers",
    popupMinWidth: 560,
  },
  {
    key: "buyerRegionCodes",
    label: "Регіон покупця",
    placeholder: "Усі регіони",
    dimension: "buyerRegions",
  },
  {
    key: "uktzed",
    label: "УКТЗЕД",
    placeholder: "Усі УКТЗЕД",
    dimension: "uktzed",
  },
  {
    key: "products",
    label: "Продукт / Номенклатура",
    placeholder: "Усі продукти",
    dimension: "products",
    popupMinWidth: 560,
  },
] as const;

const buyersFilterLabelStorageKeyPrefix = "buyers-filter-labels";

function getFilterLabelStorageKey(dimension: FilterDimension) {
  return `${buyersFilterLabelStorageKeyPrefix}:${dimension}`;
}

function readFilterLabelCache(dimension: FilterDimension) {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(
    getFilterLabelStorageKey(dimension),
  );

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (parsedValue && typeof parsedValue === "object") {
      return parsedValue as Record<string, string>;
    }
  } catch {}

  return {};
}

function formatDateLabel(value: string) {
  if (!value) {
    return "Оберіть дату";
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const parsedDate = new Date(year, month - 1, day);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
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
  const fromDate = parseIsoDate(dateFrom);
  const toDate = parseIsoDate(dateTo);

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
              defaultMonth={fromDate}
              selected={fromDate}
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
              defaultMonth={toDate}
              selected={toDate}
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

function BuyersFilterField({
  filterKey,
  label,
  placeholder,
  dimension,
  popupMinWidth,
  disabled = false,
  state,
  accessToken,
  onUpdateFilters,
}: {
  filterKey: keyof Pick<
    OverviewFilterState,
    | "buyerTaxNumbers"
    | "supplierTaxNumbers"
    | "buyerRegionCodes"
    | "uktzed"
    | "products"
  >;
  label: string;
  placeholder: string;
  dimension: FilterDimension;
  popupMinWidth?: number;
  disabled?: boolean;
  state: OverviewFilterState;
  accessToken: string | null;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
}) {
  const selectedValues = state[filterKey];
  const [searchValue, setSearchValue] = useState("");
  const [labelCache, setLabelCache] = useState<Record<string, string>>(() =>
    readFilterLabelCache(dimension),
  );
  const debouncedSearchValue = useDebouncedValue(searchValue, 350);
  const hasSelectedBuyers = state.buyerTaxNumbers.length > 0;
  const optionsState = useMemo(
    () => ({
      ...state,
      [filterKey]: [],
    }),
    [filterKey, state],
  );
  const optionsQuery = useBuyersFilterOptionsInfiniteQuery({
    state: optionsState,
    dimension,
    search: debouncedSearchValue,
    limit: 50,
    accessToken,
    enabled: dimension === "buyers" || hasSelectedBuyers,
  });

  const optionItems = useMemo(
    () => optionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [optionsQuery.data?.pages],
  );

  const selectedLabels = useMemo(() => {
    const labels: Record<string, string> = {};

    selectedValues.forEach((value) => {
      const matchedOption = optionItems.find((item) => item.value === value);
      const resolvedLabel = matchedOption?.label ?? labelCache[value];

      if (resolvedLabel) {
        labels[value] = resolvedLabel;
      }
    });

    return labels;
  }, [labelCache, optionItems, selectedValues]);

  const handleChange = useCallback(
    (values: string[]) => {
      setLabelCache((current) => {
        const next = { ...current };

        optionItems.forEach((item) => {
          if (values.includes(item.value)) {
            next[item.value] = item.label;
          }
        });

        return next;
      });

      if (filterKey === "buyerTaxNumbers") {
        onUpdateFilters({
          buyerTaxNumbers: values,
          supplierTaxNumbers: [],
          buyerRegionCodes: [],
          uktzed: [],
          products: [],
        });
        return;
      }

      onUpdateFilters({
        [filterKey]: values,
      } as Partial<OverviewFilterValues>);
    },
    [filterKey, onUpdateFilters, optionItems],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getFilterLabelStorageKey(dimension),
      JSON.stringify(labelCache),
    );
  }, [dimension, labelCache]);

  return (
    <OverviewSearchableMultiSelect
      label={label}
      placeholder={placeholder}
      disabled={disabled}
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
      popupMinWidth={popupMinWidth}
      onLoadMore={() => {
        void optionsQuery.fetchNextPage();
      }}
    />
  );
}

export function BuyersFilters({
  state,
  accessToken,
  onUpdateFilters,
  onResetFilters,
  onExport,
  isExportPending,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
  onResetFilters: () => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
}) {
  const hasSelectedBuyers = state.buyerTaxNumbers.length > 0;
  const hasActiveFilters =
    state.buyerTaxNumbers.length > 0 ||
    state.supplierTaxNumbers.length > 0 ||
    state.buyerRegionCodes.length > 0 ||
    state.uktzed.length > 0 ||
    state.products.length > 0 ||
    state.timeGrain.length > 0 ||
    state.comparisonMode !== "PREVIOUS_PERIOD" ||
    state.compareDateFrom.length > 0 ||
    state.compareDateTo.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(240px,320px)_minmax(260px,360px)] xl:flex xl:flex-wrap xl:items-start">
          <DateRangeFilter
            label="Період"
            dateFrom={state.dateFrom}
            dateTo={state.dateTo}
            onChange={({ dateFrom, dateTo }) =>
              onUpdateFilters({
                dateFrom,
                dateTo,
              })
            }
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Порівняння
            </p>
            <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm shadow-black/[0.02]">
              <div className="space-y-0.5">
                <p className="text-sm text-foreground">
                  Той самий вибраний період, попередній рік
                </p>
              </div>
              <Switch
                checked={state.comparisonMode !== "NONE"}
                onCheckedChange={(checked) =>
                  onUpdateFilters({
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
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
          >
            Очистити фільтри
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!accessToken || isExportPending || !hasSelectedBuyers}
              render={
                <Button
                  className="px-3 shadow-sm shadow-black/[0.02]"
                  disabled={
                    !accessToken || isExportPending || !hasSelectedBuyers
                  }
                >
                  <DownloadIcon />
                  {isExportPending ? "Експортуємо..." : "Експорт"}
                  <ChevronDownIcon className="size-4 text-current/75" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={() => onExport("xlsx")}>
                <FileSpreadsheetIcon />
                XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("csv")}>
                <FileTextIcon />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <BuyersFilterField
          filterKey="buyerTaxNumbers"
          label="Покупець"
          placeholder="Усі покупці"
          dimension="buyers"
          popupMinWidth={560}
          state={state}
          accessToken={accessToken}
          onUpdateFilters={onUpdateFilters}
        />

        {dependentFilters.map((filter) => (
          <BuyersFilterField
            key={filter.key}
            filterKey={filter.key}
            label={filter.label}
            placeholder={filter.placeholder}
            dimension={filter.dimension}
            popupMinWidth={
              "popupMinWidth" in filter ? filter.popupMinWidth : undefined
            }
            disabled={!hasSelectedBuyers}
            state={state}
            accessToken={accessToken}
            onUpdateFilters={onUpdateFilters}
          />
        ))}
      </div>

      {!hasSelectedBuyers ? (
        <div className="rounded-lg border border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          Виберіть одного або кількох покупців, щоб відкрити решту фільтрів.
        </div>
      ) : null}
    </div>
  );
}
