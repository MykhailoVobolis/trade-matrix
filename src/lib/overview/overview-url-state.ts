export type OverviewComparisonMode = "NONE" | "PREVIOUS_PERIOD" | "CUSTOM";
export type OverviewTimeGrain = "MONTH" | "QUARTER" | "YEAR";
export type OverviewSortDirection = "asc" | "desc";
export type OverviewTableSortBy =
  | "period"
  | "buyerRegion"
  | "buyer"
  | "supplier"
  | "product"
  | "uktzed"
  | "unit"
  | "quantity"
  | "salesWithVat"
  | "purchasesWithVat"
  | "marketShare";

export type OverviewTableState = {
  page: number;
  limit: number;
  sortBy: OverviewTableSortBy;
  sortDirection: OverviewSortDirection;
};

export type OverviewFilterState = {
  dateFrom: string;
  dateTo: string;
  comparisonMode: OverviewComparisonMode;
  compareDateFrom: string;
  compareDateTo: string;
  uktzed: string[];
  products: string[];
  buyerRegionCodes: string[];
  buyerTaxNumbers: string[];
  supplierTaxNumbers: string[];
  timeGrain: OverviewTimeGrain | "";
  table: OverviewTableState;
};

export type OverviewFilterValues = Omit<OverviewFilterState, "table">;

export const OVERVIEW_FILTER_STATE_STORAGE_KEY = "overview-filter-state";

type SearchParamsReader = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

const TABLE_LIMIT_OPTIONS = new Set([5, 10, 20, 50, 100]);
const SORT_BY_OPTIONS = new Set<OverviewTableSortBy>([
  "period",
  "buyerRegion",
  "buyer",
  "supplier",
  "product",
  "uktzed",
  "unit",
  "quantity",
  "salesWithVat",
  "purchasesWithVat",
  "marketShare",
]);

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDateRange() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    dateFrom: formatIsoDate(startOfYear),
    dateTo: formatIsoDate(today),
  };
}

export function getDefaultOverviewFilterState(): OverviewFilterState {
  const { dateFrom, dateTo } = getDefaultDateRange();

  return {
    dateFrom,
    dateTo,
    comparisonMode: "PREVIOUS_PERIOD",
    compareDateFrom: "",
    compareDateTo: "",
    uktzed: [],
    products: [],
    buyerRegionCodes: [],
    buyerTaxNumbers: [],
    supplierTaxNumbers: [],
    timeGrain: "",
    table: {
      page: 1,
      limit: 5,
      sortBy: "period",
      sortDirection: "desc",
    },
  };
}

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

function parseComparisonMode(value: string | null): OverviewComparisonMode {
  if (value === "NONE" || value === "CUSTOM" || value === "PREVIOUS_PERIOD") {
    return value;
  }

  return "PREVIOUS_PERIOD";
}

function parseTimeGrain(value: string | null): OverviewTimeGrain | "" {
  if (value === "MONTH" || value === "QUARTER" || value === "YEAR") {
    return value;
  }

  return "";
}

function parseSortBy(value: string | null): OverviewTableSortBy {
  if (value && SORT_BY_OPTIONS.has(value as OverviewTableSortBy)) {
    return value as OverviewTableSortBy;
  }

  return "period";
}

function parseSortDirection(value: string | null): OverviewSortDirection {
  return value === "asc" ? "asc" : "desc";
}

export function parseOverviewSearchParams(
  searchParams: SearchParamsReader,
): OverviewFilterState {
  const defaults = getDefaultOverviewFilterState();
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
    dateFrom: isIsoDate(dateFrom) ? dateFrom : defaults.dateFrom,
    dateTo: isIsoDate(dateTo) ? dateTo : defaults.dateTo,
    comparisonMode,
    compareDateFrom:
      comparisonMode === "CUSTOM" && isIsoDate(compareDateFrom)
        ? compareDateFrom
        : "",
    compareDateTo:
      comparisonMode === "CUSTOM" && isIsoDate(compareDateTo)
        ? compareDateTo
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
      sortDirection: parseSortDirection(searchParams.get("sortDirection")),
    },
  };
}

export function serializeOverviewSearchParams(state: OverviewFilterState) {
  const params = new URLSearchParams();
  const defaults = getDefaultOverviewFilterState();

  params.set("dateFrom", state.dateFrom);
  params.set("dateTo", state.dateTo);

  if (state.comparisonMode !== defaults.comparisonMode) {
    params.set("comparisonMode", state.comparisonMode);
  }

  if (state.comparisonMode === "CUSTOM") {
    if (state.compareDateFrom) {
      params.set("compareDateFrom", state.compareDateFrom);
    }

    if (state.compareDateTo) {
      params.set("compareDateTo", state.compareDateTo);
    }
  }

  (
    [
      ["uktzed", state.uktzed],
      ["products", state.products],
      ["buyerRegionCodes", state.buyerRegionCodes],
      ["buyerTaxNumbers", state.buyerTaxNumbers],
      ["supplierTaxNumbers", state.supplierTaxNumbers],
    ] as const
  ).forEach(([key, values]) => {
    normalizeMultiValue(values).forEach((value) => {
      params.append(key, value);
    });
  });

  if (state.timeGrain) {
    params.set("timeGrain", state.timeGrain);
  }

  if (state.table.page !== defaults.table.page) {
    params.set("page", String(state.table.page));
  }

  if (state.table.limit !== defaults.table.limit) {
    params.set("limit", String(state.table.limit));
  }

  if (state.table.sortBy !== defaults.table.sortBy) {
    params.set("sortBy", state.table.sortBy);
  }

  if (state.table.sortDirection !== defaults.table.sortDirection) {
    params.set("sortDirection", state.table.sortDirection);
  }

  return params;
}

export function normalizeOverviewFilterState(
  state: OverviewFilterState,
): OverviewFilterState {
  const defaults = getDefaultOverviewFilterState();
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
      sortBy: SORT_BY_OPTIONS.has(state.table.sortBy)
        ? state.table.sortBy
        : defaults.table.sortBy,
      sortDirection: state.table.sortDirection === "asc" ? "asc" : "desc",
    },
  };
}

export function readPersistedOverviewFilterState() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(
    OVERVIEW_FILTER_STATE_STORAGE_KEY,
  );

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeOverviewFilterState(
      JSON.parse(rawValue) as OverviewFilterState,
    );
  } catch {
    return null;
  }
}

export function persistOverviewFilterState(state: OverviewFilterState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    OVERVIEW_FILTER_STATE_STORAGE_KEY,
    JSON.stringify(normalizeOverviewFilterState(state)),
  );
}
