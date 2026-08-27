import type {
  OverviewFilterState,
  OverviewTableSortBy,
} from "@/lib/overview/overview-url-state";
import { getDefaultOverviewFilterState } from "@/lib/overview/overview-url-state";

export const PRODUCTS_FILTER_STATE_STORAGE_KEY = "products-filter-state";

const TABLE_LIMIT_OPTIONS = new Set([5, 10, 20, 50, 100]);
const PRODUCTS_SORT_BY_OPTIONS = new Set<OverviewTableSortBy>([
  "period",
  "buyerRegion",
  "buyer",
  "supplier",
  "product",
  "uktzed",
  "unit",
  "quantity",
  "priceWithVat",
  "salesWithVat",
]);

type SearchParamsReader = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

function isIsoDate(value: string | null | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeMultiValue(values: string[]) {
  return Array.from(
    new Set(
      values.map((value) => value.trim()).filter((value) => value.length > 0),
    ),
  );
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseComparisonMode(value: string | null) {
  if (value === "NONE" || value === "CUSTOM" || value === "PREVIOUS_PERIOD") {
    return value;
  }

  return "PREVIOUS_PERIOD" as const;
}

function parseTimeGrain(value: string | null) {
  if (value === "MONTH" || value === "QUARTER" || value === "YEAR") {
    return value;
  }

  return "";
}

function parseSortBy(value: string | null): OverviewTableSortBy {
  if (value && PRODUCTS_SORT_BY_OPTIONS.has(value as OverviewTableSortBy)) {
    return value as OverviewTableSortBy;
  }

  return "period";
}

function parseSortDirection(value: string | null, fallback: "asc" | "desc") {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return fallback;
}

export function getDefaultProductsFilterState(): OverviewFilterState {
  const defaults = getDefaultOverviewFilterState();

  return {
    ...defaults,
    table: {
      ...defaults.table,
      sortBy: "period",
      sortDirection: "asc",
    },
  };
}

export function parseProductsSearchParams(
  searchParams: SearchParamsReader,
): OverviewFilterState {
  const defaults = getDefaultProductsFilterState();
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const comparisonMode = parseComparisonMode(
    searchParams.get("comparisonMode"),
  );
  const compareDateFrom = searchParams.get("compareDateFrom");
  const compareDateTo = searchParams.get("compareDateTo");
  const limit = parsePositiveInt(
    searchParams.get("limit"),
    defaults.table.limit,
  );

  return {
    dateFrom: isIsoDate(dateFrom) ? dateFrom! : defaults.dateFrom,
    dateTo: isIsoDate(dateTo) ? dateTo! : defaults.dateTo,
    comparisonMode,
    compareDateFrom:
      comparisonMode === "CUSTOM" && isIsoDate(compareDateFrom)
        ? compareDateFrom!
        : "",
    compareDateTo:
      comparisonMode === "CUSTOM" && isIsoDate(compareDateTo)
        ? compareDateTo!
        : "",
    uktzed: normalizeMultiValue(searchParams.getAll("uktzed")),
    products: normalizeMultiValue(searchParams.getAll("products")),
    buyerRegionCodes: normalizeMultiValue(
      searchParams.getAll("buyerRegionCodes"),
    ),
    buyerTaxNumbers: normalizeMultiValue(
      searchParams.getAll("buyerTaxNumbers"),
    ),
    supplierTaxNumbers: normalizeMultiValue(
      searchParams.getAll("supplierTaxNumbers"),
    ),
    timeGrain: parseTimeGrain(searchParams.get("timeGrain")),
    table: {
      page: parsePositiveInt(searchParams.get("page"), defaults.table.page),
      limit: TABLE_LIMIT_OPTIONS.has(limit) ? limit : defaults.table.limit,
      sortBy: parseSortBy(searchParams.get("sortBy")),
      sortDirection: parseSortDirection(
        searchParams.get("sortDirection"),
        defaults.table.sortDirection,
      ),
    },
  };
}

export function normalizeProductsFilterState(
  state: OverviewFilterState,
): OverviewFilterState {
  const defaults = getDefaultProductsFilterState();
  const dateFrom = isIsoDate(state.dateFrom)
    ? state.dateFrom
    : defaults.dateFrom;
  const dateTo = isIsoDate(state.dateTo) ? state.dateTo : defaults.dateTo;
  const comparisonMode =
    state.comparisonMode === "NONE" ||
    state.comparisonMode === "CUSTOM" ||
    state.comparisonMode === "PREVIOUS_PERIOD"
      ? state.comparisonMode
      : defaults.comparisonMode;
  const timeGrain =
    state.timeGrain === "MONTH" ||
    state.timeGrain === "QUARTER" ||
    state.timeGrain === "YEAR"
      ? state.timeGrain
      : "";
  const limit = TABLE_LIMIT_OPTIONS.has(state.table.limit)
    ? state.table.limit
    : defaults.table.limit;

  return {
    dateFrom,
    dateTo,
    comparisonMode,
    compareDateFrom:
      comparisonMode === "CUSTOM" && isIsoDate(state.compareDateFrom)
        ? state.compareDateFrom
        : "",
    compareDateTo:
      comparisonMode === "CUSTOM" && isIsoDate(state.compareDateTo)
        ? state.compareDateTo
        : "",
    uktzed: normalizeMultiValue(state.uktzed),
    products: normalizeMultiValue(state.products),
    buyerRegionCodes: normalizeMultiValue(state.buyerRegionCodes),
    buyerTaxNumbers: normalizeMultiValue(state.buyerTaxNumbers),
    supplierTaxNumbers: normalizeMultiValue(state.supplierTaxNumbers),
    timeGrain,
    table: {
      page:
        Number.isInteger(state.table.page) && state.table.page > 0
          ? state.table.page
          : defaults.table.page,
      limit,
      sortBy: PRODUCTS_SORT_BY_OPTIONS.has(state.table.sortBy)
        ? state.table.sortBy
        : defaults.table.sortBy,
      sortDirection: state.table.sortDirection === "desc" ? "desc" : "asc",
    },
  };
}

export function serializeProductsSearchParams(state: OverviewFilterState) {
  const defaults = getDefaultProductsFilterState();
  const normalizedState = normalizeProductsFilterState(state);
  const params = new URLSearchParams();

  params.set("dateFrom", normalizedState.dateFrom);
  params.set("dateTo", normalizedState.dateTo);

  if (normalizedState.comparisonMode !== defaults.comparisonMode) {
    params.set("comparisonMode", normalizedState.comparisonMode);
  }

  if (normalizedState.comparisonMode === "CUSTOM") {
    if (normalizedState.compareDateFrom) {
      params.set("compareDateFrom", normalizedState.compareDateFrom);
    }

    if (normalizedState.compareDateTo) {
      params.set("compareDateTo", normalizedState.compareDateTo);
    }
  }

  (
    [
      ["products", normalizedState.products],
      ["uktzed", normalizedState.uktzed],
      ["supplierTaxNumbers", normalizedState.supplierTaxNumbers],
      ["buyerTaxNumbers", normalizedState.buyerTaxNumbers],
      ["buyerRegionCodes", normalizedState.buyerRegionCodes],
    ] as const
  ).forEach(([key, values]) => {
    normalizeMultiValue(values).forEach((value) => {
      params.append(key, value);
    });
  });

  if (normalizedState.timeGrain) {
    params.set("timeGrain", normalizedState.timeGrain);
  }

  if (normalizedState.table.page !== defaults.table.page) {
    params.set("page", String(normalizedState.table.page));
  }

  if (normalizedState.table.limit !== defaults.table.limit) {
    params.set("limit", String(normalizedState.table.limit));
  }

  if (normalizedState.table.sortBy !== defaults.table.sortBy) {
    params.set("sortBy", normalizedState.table.sortBy);
  }

  if (normalizedState.table.sortDirection !== defaults.table.sortDirection) {
    params.set("sortDirection", normalizedState.table.sortDirection);
  }

  return params;
}

export function persistProductsFilterState(state: OverviewFilterState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PRODUCTS_FILTER_STATE_STORAGE_KEY,
    JSON.stringify(normalizeProductsFilterState(state)),
  );
}

export function readPersistedProductsFilterState() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(
    PRODUCTS_FILTER_STATE_STORAGE_KEY,
  );

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeProductsFilterState(
      JSON.parse(rawValue) as OverviewFilterState,
    );
  } catch {
    return null;
  }
}
