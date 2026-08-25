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
import type {
  OverviewFilterState,
  OverviewFilterValues,
} from "@/lib/overview/overview-url-state";

type MockProductRelation = {
  product: string;
  uktzed: string;
  suppliers: string[];
  buyers: string[];
  regions: string[];
};

const mockCatalog: MockProductRelation[] = [
  {
    product: "Мастило Літол-24 у бочці, 180 кг",
    uktzed: "2710199900",
    suppliers: ['ТОВ "ЕВРО ОЙЛ ПРОДАКШН"', 'ТОВ "БЕСТ ТЕРРА ОЙЛ"'],
    buyers: ['ТОВ "МЕГАРОСТ"', 'ТОВ "ІНБЛАСТ"'],
    regions: ["Одеська обл.", "Дніпропетровська обл."],
  },
  {
    product: "Олива компресорна E-OIL K-28",
    uktzed: "2710198100",
    suppliers: ['ТОВ "ЕВРО ОЙЛ ПРОДАКШН"', 'ТОВ "ЛІНКОР"'],
    buyers: ['ТОВ "ПАЛІТРА"', 'ТОВ "СП СОКОЛИ"'],
    regions: ["Київська обл.", "Львівська обл."],
  },
  {
    product: "Олива турбінна Тп-22 у каністрі, 20 л",
    uktzed: "2710198800",
    suppliers: ['ТОВ "ГАЗТРОН ТРЕЙД"'],
    buyers: ['ТОВ "МЕГАРОСТ"', 'ТОВ "ПОЛТЕХКОМПЛЕКТ"'],
    regions: ["Харківська обл.", "Полтавська обл."],
  },
  {
    product: "Wexoil Hydrex HVLP 46",
    uktzed: "2710199200",
    suppliers: ['ТОВ "БЕСТ ТЕРРА ОЙЛ"', 'ТОВ "АСТ"'],
    buyers: ['ТОВ "ІНБЛАСТ"', 'ТОВ "ПАЛІТРА"'],
    regions: ["Дніпропетровська обл.", "Київська обл."],
  },
];

const dependentFilters = [
  {
    key: "supplierTaxNumbers",
    label: "Постачальник",
    placeholder: "Усі постачальники",
    dimension: "suppliers",
    popupMinWidth: 560,
  },
  {
    key: "buyerTaxNumbers",
    label: "Покупець",
    placeholder: "Усі покупці",
    dimension: "buyers",
    popupMinWidth: 560,
  },
  {
    key: "buyerRegionCodes",
    label: "Регіон покупця",
    placeholder: "Усі регіони",
    dimension: "buyerRegions",
  },
] as const;

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

function useDebouncedValue<T>(value: T, delayMs = 250) {
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

function toSlugMap(values: string[]) {
  return Object.fromEntries(values.map((value) => [value, value]));
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
              startMonth={new Date(dateFrom || "2020-01-01")}
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

function StaticFilterField({
  filterKey,
  label,
  placeholder,
  values,
  options,
  disabled = false,
  popupMinWidth,
  onUpdateFilters,
}: {
  filterKey: keyof Pick<
    OverviewFilterValues,
    | "products"
    | "uktzed"
    | "supplierTaxNumbers"
    | "buyerTaxNumbers"
    | "buyerRegionCodes"
  >;
  label: string;
  placeholder: string;
  values: string[];
  options: string[];
  disabled?: boolean;
  popupMinWidth?: number;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.toLowerCase().includes(normalizedSearch),
    );
  }, [debouncedSearch, options]);

  return (
    <OverviewSearchableMultiSelect
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      selectedValues={values}
      selectedLabels={toSlugMap(options)}
      options={filteredOptions.map((option) => ({
        value: option,
        label: option,
      }))}
      isLoading={false}
      isError={false}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      popupMinWidth={popupMinWidth}
      onChange={(nextValues) =>
        onUpdateFilters({
          [filterKey]: nextValues,
        })
      }
    />
  );
}

type ProductsFiltersProps = {
  state: OverviewFilterState;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
  onResetFilters: () => void;
};

export function ProductsFilters({
  state,
  onUpdateFilters,
  onResetFilters,
}: ProductsFiltersProps) {
  const productOptions = useMemo(
    () => Array.from(new Set(mockCatalog.map((item) => item.product))).sort(),
    [],
  );
  const uktzedOptions = useMemo(
    () => Array.from(new Set(mockCatalog.map((item) => item.uktzed))).sort(),
    [],
  );

  const isPrimarySelectionActive =
    state.products.length > 0 || state.uktzed.length > 0;

  const scopedEntries = useMemo(() => {
    if (!isPrimarySelectionActive) {
      return [];
    }

    return mockCatalog.filter((entry) => {
      const matchesProducts =
        state.products.length === 0 || state.products.includes(entry.product);
      const matchesUktzed =
        state.uktzed.length === 0 || state.uktzed.includes(entry.uktzed);

      return matchesProducts && matchesUktzed;
    });
  }, [isPrimarySelectionActive, state.products, state.uktzed]);

  const supplierOptions = useMemo(
    () =>
      Array.from(
        new Set(scopedEntries.flatMap((entry) => entry.suppliers)),
      ).sort(),
    [scopedEntries],
  );
  const buyerOptions = useMemo(
    () =>
      Array.from(
        new Set(scopedEntries.flatMap((entry) => entry.buyers)),
      ).sort(),
    [scopedEntries],
  );
  const regionOptions = useMemo(
    () =>
      Array.from(
        new Set(scopedEntries.flatMap((entry) => entry.regions)),
      ).sort(),
    [scopedEntries],
  );

  const hasActiveFilters =
    state.products.length > 0 ||
    state.uktzed.length > 0 ||
    state.supplierTaxNumbers.length > 0 ||
    state.buyerTaxNumbers.length > 0 ||
    state.buyerRegionCodes.length > 0 ||
    state.comparisonMode !== "PREVIOUS_PERIOD" ||
    state.timeGrain.length > 0;

  const handlePrimaryUpdate = useCallback(
    (patch: Partial<OverviewFilterValues>) => {
      const nextProducts = patch.products ?? state.products;
      const nextUktzed = patch.uktzed ?? state.uktzed;
      const nextScopedEntries = mockCatalog.filter((entry) => {
        const matchesProducts =
          nextProducts.length === 0 || nextProducts.includes(entry.product);
        const matchesUktzed =
          nextUktzed.length === 0 || nextUktzed.includes(entry.uktzed);

        return matchesProducts && matchesUktzed;
      });
      const nextPrimaryActive =
        nextProducts.length > 0 || nextUktzed.length > 0;
      const nextSuppliers = nextPrimaryActive
        ? new Set(nextScopedEntries.flatMap((entry) => entry.suppliers))
        : new Set<string>();
      const nextBuyers = nextPrimaryActive
        ? new Set(nextScopedEntries.flatMap((entry) => entry.buyers))
        : new Set<string>();
      const nextRegions = nextPrimaryActive
        ? new Set(nextScopedEntries.flatMap((entry) => entry.regions))
        : new Set<string>();

      onUpdateFilters({
        ...patch,
        supplierTaxNumbers: nextPrimaryActive
          ? state.supplierTaxNumbers.filter((value) => nextSuppliers.has(value))
          : [],
        buyerTaxNumbers: nextPrimaryActive
          ? state.buyerTaxNumbers.filter((value) => nextBuyers.has(value))
          : [],
        buyerRegionCodes: nextPrimaryActive
          ? state.buyerRegionCodes.filter((value) => nextRegions.has(value))
          : [],
      });
    },
    [
      onUpdateFilters,
      state.buyerRegionCodes,
      state.buyerTaxNumbers,
      state.products,
      state.supplierTaxNumbers,
      state.uktzed,
    ],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid gap-3 md:grid-cols-[minmax(240px,320px)_minmax(260px,360px)] xl:flex xl:flex-wrap xl:items-start">
          <DateRangeFilter
            label="Період"
            dateFrom={state.dateFrom}
            dateTo={state.dateTo}
            onChange={onUpdateFilters}
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
            type="button"
            variant="outline"
            className="px-3 shadow-sm shadow-black/[0.02]"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            Очистити фільтри
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              disabled
              render={
                <Button
                  className="px-3 shadow-sm shadow-black/[0.02]"
                  disabled
                >
                  <DownloadIcon />
                  Експорт
                  <ChevronDownIcon className="size-4 text-current/75" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem disabled>
                <FileSpreadsheetIcon />
                XLSX
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <FileTextIcon />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <StaticFilterField
          filterKey="products"
          label="Продукт / Номенклатура"
          placeholder="Усі продукти"
          values={state.products}
          options={productOptions}
          popupMinWidth={620}
          onUpdateFilters={handlePrimaryUpdate}
        />
        <StaticFilterField
          filterKey="uktzed"
          label="УКТЗЕД"
          placeholder="Усі УКТЗЕД"
          values={state.uktzed}
          options={uktzedOptions}
          onUpdateFilters={handlePrimaryUpdate}
        />
        {dependentFilters.map((filter) => (
          <StaticFilterField
            key={filter.key}
            filterKey={filter.key}
            label={filter.label}
            placeholder={filter.placeholder}
            values={state[filter.key]}
            options={
              filter.dimension === "suppliers"
                ? supplierOptions
                : filter.dimension === "buyers"
                  ? buyerOptions
                  : regionOptions
            }
            disabled={!isPrimarySelectionActive}
            popupMinWidth={filter.popupMinWidth}
            onUpdateFilters={onUpdateFilters}
          />
        ))}
      </div>

      {!isPrimarySelectionActive ? (
        <div className="rounded-md border border-border/70 bg-muted/15 px-3.5 py-3 text-sm text-muted-foreground">
          Оберіть один або кілька продуктів чи кодів УКТЗЕД, щоб розблокувати
          фільтри постачальників, покупців і регіону покупця.
        </div>
      ) : null}
    </div>
  );
}
