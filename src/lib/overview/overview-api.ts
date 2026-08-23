import { requestBlob, requestJson } from "@/lib/api/http-client";
import type {
  OverviewComparisonMode,
  OverviewFilterState,
  OverviewTimeGrain,
} from "@/lib/overview/overview-url-state";

export type OverviewMetric = {
  current: number;
  previous: number;
  deltaPercent: number | null;
  hasComparablePrevious: boolean;
};

export type OverviewPeriod = {
  dateFrom: string;
  dateTo: string;
  timeGrain: OverviewTimeGrain;
};

export type OverviewComparison = {
  mode: OverviewComparisonMode;
  dateFrom: string | null;
  dateTo: string | null;
};

export type OverviewTrendItem = {
  periodStart: string;
  periodLabel: string;
  salesWithVat: number;
  purchasesWithVat: number;
  comparisonSalesWithVat: number | null;
  comparisonPurchasesWithVat: number | null;
};

export type OverviewMarketStructureValue = {
  name: string;
  amount: number;
  share: number;
  code?: string | null;
  description?: string | null;
};

export type OverviewMarketStructureRegionValue = {
  regionCode: string | null;
  regionName: string;
  amount: number;
  share: number;
};

export type OverviewMarketStructure = {
  topBuyer: OverviewMarketStructureValue | null;
  topSupplier: OverviewMarketStructureValue | null;
  topBuyerRegion: OverviewMarketStructureRegionValue | null;
  topUKTZED: OverviewMarketStructureValue | null;
  top5BuyersShare: number | null;
  top5SuppliersShare: number | null;
};

export type OverviewRankingItem = {
  id: string;
  name: string;
  amount: number;
  share: number;
  previousAmount: number | null;
  deltaPercent: number | null;
};

export type OverviewProductRankingItem = {
  productId: string;
  name: string;
  uktzed: string | null;
  amount: number;
  share: number;
  previousAmount: number | null;
  deltaPercent: number | null;
};

export type OverviewRegionRankingItem = {
  regionCode: string;
  regionName: string;
  amount: number;
  share: number;
  activeBuyers: number | null;
  previousAmount: number | null;
  deltaPercent: number | null;
};

export type OverviewInsightType =
  | "SALES_CHANGE"
  | "PURCHASES_CHANGE"
  | "PEAK_SALES_PERIOD"
  | "PEAK_PURCHASES_PERIOD"
  | "BUYER_CONCENTRATION"
  | "SUPPLIER_CONCENTRATION"
  | "TOP_REGION"
  | "TOP_UKTZED";

export type OverviewInsight = {
  type: OverviewInsightType;
  payload: Record<string, string | number | null>;
};

export type OverviewResponse = {
  period: OverviewPeriod;
  comparison: OverviewComparison;
  kpi: {
    salesWithVat: OverviewMetric;
    purchasesWithVat: OverviewMetric;
    balance: OverviewMetric;
    activeBuyers: OverviewMetric;
    activeSuppliers: OverviewMetric;
    salesRegions: OverviewMetric;
  };
  trend: OverviewTrendItem[];
  marketStructure: OverviewMarketStructure;
  topBuyers: OverviewRankingItem[];
  topSuppliers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  insights: OverviewInsight[];
};

export type OverviewTableItem = {
  period: string;
  buyerRegionCode: string | null;
  buyerRegionName: string;
  buyerTaxNumber: string | null;
  buyerName: string;
  supplierTaxNumber: string | null;
  supplierName: string;
  product: string;
  uktzed: string | null;
  unit: string | null;
  quantity: number | null;
  priceWithVat: number | null;
  salesWithVat: number | null;
  purchasesWithVat: number | null;
  marketShare: number | null;
};

export type OverviewTableResponse = {
  items: OverviewTableItem[];
  total: number;
  page: number;
  limit: number;
};

export type OverviewFilterOptionsDimension =
  "buyers" | "suppliers" | "products" | "uktzed" | "buyerRegions";

export type OverviewFilterOption = {
  value: string;
  label: string;
};

export type OverviewFilterOptionsResponse = {
  dimension: OverviewFilterOptionsDimension;
  items: OverviewFilterOption[];
  total: number;
  page: number;
  limit: number;
};

export type OverviewExportFormat = "csv" | "xlsx";

export type OverviewExportResult = {
  blob: Blob;
  fileName: string;
  contentType: string;
};

function appendMultiValue(
  params: URLSearchParams,
  key: string,
  values: string[],
) {
  values.forEach((value) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      params.append(key, normalizedValue);
    }
  });
}

export function buildOverviewBaseSearchParams(
  state: OverviewFilterState,
): URLSearchParams {
  const params = new URLSearchParams();

  params.set("dateFrom", state.dateFrom);
  params.set("dateTo", state.dateTo);
  params.set("comparisonMode", state.comparisonMode);

  if (state.compareDateFrom) {
    params.set("compareDateFrom", state.compareDateFrom);
  }

  if (state.compareDateTo) {
    params.set("compareDateTo", state.compareDateTo);
  }

  appendMultiValue(params, "uktzed", state.uktzed);
  appendMultiValue(params, "products", state.products);
  appendMultiValue(params, "buyerRegionCodes", state.buyerRegionCodes);
  appendMultiValue(params, "buyerTaxNumbers", state.buyerTaxNumbers);
  appendMultiValue(params, "supplierTaxNumbers", state.supplierTaxNumbers);

  if (state.timeGrain) {
    params.set("timeGrain", state.timeGrain);
  }

  return params;
}

export function buildOverviewTableSearchParams(
  state: OverviewFilterState,
): URLSearchParams {
  const params = buildOverviewBaseSearchParams(state);

  params.set("page", String(state.table.page));
  params.set("limit", String(state.table.limit));
  params.set("sortBy", state.table.sortBy);
  params.set("sortDirection", state.table.sortDirection);

  return params;
}

function buildRequestPath(path: string, params: URLSearchParams) {
  const queryString = params.toString();

  return queryString ? `${path}?${queryString}` : path;
}

function getFileNameFromDisposition(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = headerValue.match(/filename="([^"]+)"/i);

  return basicMatch?.[1] ?? null;
}

export async function getOverviewRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<OverviewResponse> {
  return requestJson<OverviewResponse>({
    path: buildRequestPath(
      "/api/analytics/overview",
      buildOverviewBaseSearchParams(state),
    ),
    accessToken,
  });
}

export async function getOverviewTableRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<OverviewTableResponse> {
  return requestJson<OverviewTableResponse>({
    path: buildRequestPath(
      "/api/analytics/overview/table",
      buildOverviewTableSearchParams(state),
    ),
    accessToken,
  });
}

export async function getOverviewFilterOptionsRequest({
  state,
  dimension,
  search,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: OverviewFilterOptionsDimension;
  search?: string;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<OverviewFilterOptionsResponse> {
  const params = buildOverviewBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return requestJson<OverviewFilterOptionsResponse>({
    path: buildRequestPath("/api/analytics/filter-options", params),
    accessToken,
  });
}

export async function exportOverviewRequest({
  state,
  format,
  accessToken,
}: {
  state: OverviewFilterState;
  format: OverviewExportFormat;
  accessToken: string;
}): Promise<OverviewExportResult> {
  const params = buildOverviewBaseSearchParams(state);
  params.set("format", format);

  const { blob, headers } = await requestBlob({
    path: buildRequestPath("/api/analytics/overview/export", params),
    accessToken,
  });

  return {
    blob,
    fileName:
      getFileNameFromDisposition(headers.get("content-disposition")) ??
      `overview-report-${state.dateFrom}-${state.dateTo}.${format}`,
    contentType: headers.get("content-type") ?? blob.type,
  };
}
