import { requestBlob, requestJson } from "@/lib/api/http-client";
import type {
  OverviewComparison,
  OverviewExportFormat,
  OverviewExportResult,
  OverviewFilterOption,
  OverviewInsight,
  OverviewMetric,
  OverviewPeriod,
  OverviewRankingItem,
  OverviewRegionRankingItem,
  RankingsResponse,
} from "@/lib/overview/overview-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export type ProductsDashboardResponse = {
  period: OverviewPeriod;
  comparison: OverviewComparison;
  kpi: {
    salesWithVat: OverviewMetric;
    activeBuyers: OverviewMetric;
    activeSuppliers: OverviewMetric;
    salesRegions: OverviewMetric;
  };
  trend: Array<{
    periodStart: string;
    periodLabel: string;
    salesWithVat: number;
    comparisonSalesWithVat: number | null;
  }>;
  marketStructure: {
    topSupplier: OverviewRankingItem | null;
    topBuyer: OverviewRankingItem | null;
    topBuyerRegion: {
      regionCode: string | null;
      regionName: string | null;
      amount: number;
      share: number;
      activeBuyers: number | null;
    } | null;
    top5SuppliersShare: number | null;
    top5BuyersShare: number | null;
    top5RegionsShare: number | null;
  };
  topBuyers: OverviewRankingItem[];
  topSuppliers: OverviewRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  insights: OverviewInsight[];
};

export type ProductsTableItem = {
  period: string;
  buyerRegionCode: string | null;
  buyerRegionName: string | null;
  buyerTaxNumber: string | null;
  buyerName: string | null;
  supplierTaxNumber: string | null;
  supplierName: string | null;
  product: string | null;
  uktzed: string | null;
  unit: string | null;
  quantity: number | null;
  priceWithVat: number | null;
  salesWithVat: number;
};

export type ProductsTableResponse = {
  items: ProductsTableItem[];
  total: number;
  page: number;
  limit: number;
};

export type ProductsFilterOptionsDimension =
  "products" | "uktzed" | "suppliers" | "buyers" | "buyerRegions";

export type ProductsFilterOption = OverviewFilterOption;
export type ProductsFilterOptionsResponse = {
  dimension: ProductsFilterOptionsDimension;
  items: ProductsFilterOption[];
  total: number;
  page: number;
  limit: number;
};

export type ProductsRankingDimension = "buyers" | "suppliers" | "regions";
export type ProductsEntityRankingsResponse =
  RankingsResponse<OverviewRankingItem>;
export type ProductsRegionRankingsResponse =
  RankingsResponse<OverviewRegionRankingItem>;

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

export function buildProductsBaseSearchParams(
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

  appendMultiValue(params, "products", state.products);
  appendMultiValue(params, "uktzed", state.uktzed);
  appendMultiValue(params, "supplierTaxNumbers", state.supplierTaxNumbers);
  appendMultiValue(params, "buyerTaxNumbers", state.buyerTaxNumbers);
  appendMultiValue(params, "buyerRegionCodes", state.buyerRegionCodes);

  if (state.timeGrain) {
    params.set("timeGrain", state.timeGrain);
  }

  return params;
}

export function buildProductsTableSearchParams(
  state: OverviewFilterState,
): URLSearchParams {
  const params = buildProductsBaseSearchParams(state);

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

export async function getProductsDashboardRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<ProductsDashboardResponse> {
  return requestJson<ProductsDashboardResponse>({
    path: buildRequestPath(
      "/api/analytics/products",
      buildProductsBaseSearchParams(state),
    ),
    accessToken,
  });
}

export async function getProductsTableRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<ProductsTableResponse> {
  return requestJson<ProductsTableResponse>({
    path: buildRequestPath(
      "/api/analytics/products/table",
      buildProductsTableSearchParams(state),
    ),
    accessToken,
  });
}

export async function getProductsFilterOptionsRequest({
  state,
  dimension,
  search,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: ProductsFilterOptionsDimension;
  search?: string;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<ProductsFilterOptionsResponse> {
  const params = buildProductsBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return requestJson<ProductsFilterOptionsResponse>({
    path: buildRequestPath("/api/analytics/products/filter-options", params),
    accessToken,
  });
}

export async function getProductsRankingsRequest({
  state,
  dimension,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: ProductsRankingDimension;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<ProductsEntityRankingsResponse | ProductsRegionRankingsResponse> {
  const params = buildProductsBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return requestJson<
    ProductsEntityRankingsResponse | ProductsRegionRankingsResponse
  >({
    path: buildRequestPath("/api/analytics/products/rankings", params),
    accessToken,
  });
}

export async function exportProductsRequest({
  state,
  format,
  accessToken,
}: {
  state: OverviewFilterState;
  format: OverviewExportFormat;
  accessToken: string;
}): Promise<OverviewExportResult> {
  const params = buildProductsBaseSearchParams(state);
  params.set("format", format);

  const response = await requestBlob({
    path: buildRequestPath("/api/analytics/products/export", params),
    accessToken,
  });

  return {
    blob: response.blob,
    contentType: response.headers.get("content-type") ?? "",
    fileName:
      getFileNameFromDisposition(response.headers.get("content-disposition")) ??
      `products-report-${state.dateFrom}-${state.dateTo}.${format}`,
  };
}
