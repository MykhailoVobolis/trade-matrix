import { requestBlob, requestJson } from "@/lib/api/http-client";
import type {
  OverviewComparison,
  OverviewExportFormat,
  OverviewExportResult,
  OverviewFilterOption,
  OverviewMetric,
  OverviewPeriod,
  OverviewProductRankingItem,
  OverviewRankingItem,
  RankingsResponse,
} from "@/lib/overview/overview-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export type BuyersInsightType =
  "PURCHASES_CHANGE" | "PEAK_PURCHASES_PERIOD" | "TOP_BUYER_REGION";

export type BuyersInsight = {
  type: BuyersInsightType;
  payload: Record<string, string | number | null>;
};

export type BuyersRegionRankingItem = {
  regionCode: string | null;
  regionName: string | null;
  amount: number;
  share: number;
  activeSuppliers: number | null;
  previousAmount: number | null;
  deltaPercent: number | null;
};

export type BuyersDashboardResponse = {
  period: OverviewPeriod;
  comparison: OverviewComparison;
  kpi: {
    purchasesWithVat: OverviewMetric;
    activeSuppliers: OverviewMetric;
    buyerRegions: OverviewMetric;
    productPositions: OverviewMetric;
  };
  trend: Array<{
    periodStart: string;
    periodLabel: string;
    purchasesWithVat: number;
    salesWithVat: number;
    comparisonPurchasesWithVat: number | null;
    comparisonSalesWithVat: number | null;
  }>;
  marketStructure: {
    topSupplier: OverviewRankingItem | null;
    topBuyerRegion: {
      regionCode: string | null;
      regionName: string | null;
      amount: number;
      share: number;
      activeSuppliers: number | null;
    } | null;
    topUKTZED: {
      code: string | null;
      name: string;
      description: string | null;
      amount: number;
      share: number;
    } | null;
    top5SuppliersShare: number | null;
    top5ProductsShare: number | null;
    top5SupplierRegionsShare: number | null;
  };
  topSuppliers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topBuyerRegions: BuyersRegionRankingItem[];
  insights: BuyersInsight[];
};

export type BuyersTableItem = {
  period: string;
  buyerRegionCode?: string | null;
  buyerRegionName?: string | null;
  buyerTaxNumber: string | null;
  buyerName: string | null;
  supplierTaxNumber: string | null;
  supplierName: string | null;
  product: string | null;
  uktzed: string | null;
  unit: string | null;
  quantity: number | null;
  priceWithVat: number | null;
  purchasesWithVat: number;
};

export type BuyersTableResponse = {
  items: BuyersTableItem[];
  total: number;
  page: number;
  limit: number;
};

export type BuyersFilterOptionsDimension =
  "buyers" | "suppliers" | "products" | "uktzed" | "buyerRegions";

export type BuyersFilterOption = OverviewFilterOption;
export type BuyersFilterOptionsResponse = {
  dimension: BuyersFilterOptionsDimension;
  items: BuyersFilterOption[];
  total: number;
  page: number;
  limit: number;
};

export type BuyersRankingDimension = "suppliers" | "products" | "regions";
export type BuyersEntityRankingsResponse =
  RankingsResponse<OverviewRankingItem>;
export type BuyersProductRankingsResponse =
  RankingsResponse<OverviewProductRankingItem>;
export type BuyersRegionRankingsResponse =
  RankingsResponse<BuyersRegionRankingItem>;

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

export function buildBuyersBaseSearchParams(
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

  appendMultiValue(params, "buyerTaxNumbers", state.buyerTaxNumbers);
  appendMultiValue(params, "supplierTaxNumbers", state.supplierTaxNumbers);
  appendMultiValue(params, "buyerRegionCodes", state.buyerRegionCodes);
  appendMultiValue(params, "uktzed", state.uktzed);
  appendMultiValue(params, "products", state.products);

  if (state.timeGrain) {
    params.set("timeGrain", state.timeGrain);
  }

  return params;
}

export function buildBuyersTableSearchParams(
  state: OverviewFilterState,
): URLSearchParams {
  const params = buildBuyersBaseSearchParams(state);

  params.set("page", String(state.table.page));
  params.set("limit", String(state.table.limit));
  params.set(
    "sortBy",
    state.table.sortBy === "buyerRegion" ? "buyerRegion" : state.table.sortBy,
  );
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

export async function getBuyersDashboardRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<BuyersDashboardResponse> {
  return requestJson<BuyersDashboardResponse>({
    path: buildRequestPath(
      "/api/analytics/buyers",
      buildBuyersBaseSearchParams(state),
    ),
    accessToken,
  });
}

export async function getBuyersTableRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<BuyersTableResponse> {
  return requestJson<BuyersTableResponse>({
    path: buildRequestPath(
      "/api/analytics/buyers/table",
      buildBuyersTableSearchParams(state),
    ),
    accessToken,
  });
}

export async function getBuyersFilterOptionsRequest({
  state,
  dimension,
  search,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: BuyersFilterOptionsDimension;
  search?: string;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<BuyersFilterOptionsResponse> {
  const params = buildBuyersBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return requestJson<BuyersFilterOptionsResponse>({
    path: buildRequestPath("/api/analytics/buyers/filter-options", params),
    accessToken,
  });
}

export async function getBuyersRankingsRequest({
  state,
  dimension,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: BuyersRankingDimension;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<
  | BuyersEntityRankingsResponse
  | BuyersProductRankingsResponse
  | BuyersRegionRankingsResponse
> {
  const params = buildBuyersBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return requestJson<
    | BuyersEntityRankingsResponse
    | BuyersProductRankingsResponse
    | BuyersRegionRankingsResponse
  >({
    path: buildRequestPath("/api/analytics/buyers/rankings", params),
    accessToken,
  });
}

export async function exportBuyersRequest({
  state,
  format,
  accessToken,
}: {
  state: OverviewFilterState;
  format: OverviewExportFormat;
  accessToken: string;
}): Promise<OverviewExportResult> {
  const params = buildBuyersBaseSearchParams(state);
  params.set("format", format);

  const { blob, headers } = await requestBlob({
    path: buildRequestPath("/api/analytics/buyers/export", params),
    accessToken,
  });

  return {
    blob,
    fileName:
      getFileNameFromDisposition(headers.get("content-disposition")) ??
      `buyers-report-${state.dateFrom}-${state.dateTo}.${format}`,
    contentType: headers.get("content-type") ?? blob.type,
  };
}
