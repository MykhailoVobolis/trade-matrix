import { requestBlob, requestJson } from "@/lib/api/http-client";
import type {
  OverviewComparison,
  OverviewExportFormat,
  OverviewExportResult,
  OverviewFilterOption,
  OverviewFilterOptionsDimension,
  OverviewFilterOptionsResponse,
  OverviewInsight,
  OverviewMetric,
  OverviewPeriod,
  OverviewProductRankingItem,
  OverviewRankingItem,
  OverviewRegionRankingItem,
  OverviewTrendItem,
} from "@/lib/overview/overview-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export type SuppliersDashboardResponse = {
  period: OverviewPeriod;
  comparison: OverviewComparison;
  kpi: {
    salesWithVat: OverviewMetric;
    activeBuyers: OverviewMetric;
    salesRegions: OverviewMetric;
    productPositions: OverviewMetric;
  };
  trend: OverviewTrendItem[];
  marketStructure: {
    topBuyer: OverviewRankingItem | null;
    topBuyerRegion: {
      regionCode: string | null;
      regionName: string;
      amount: number;
      share: number;
    } | null;
    topUKTZED: {
      code: string | null;
      name: string;
      description: string | null;
      amount: number;
      share: number;
    } | null;
    top5BuyersShare: number | null;
  };
  topBuyers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  insights: OverviewInsight[];
};

export type SuppliersTableItem = {
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

export type SuppliersTableResponse = {
  items: SuppliersTableItem[];
  total: number;
  page: number;
  limit: number;
};

export type SuppliersFilterOption = OverviewFilterOption;
export type SuppliersFilterOptionsResponse = OverviewFilterOptionsResponse;
export type SuppliersFilterOptionsDimension = OverviewFilterOptionsDimension;

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

export function buildSuppliersBaseSearchParams(
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

  appendMultiValue(params, "supplierTaxNumbers", state.supplierTaxNumbers);
  appendMultiValue(params, "buyerTaxNumbers", state.buyerTaxNumbers);
  appendMultiValue(params, "buyerRegionCodes", state.buyerRegionCodes);
  appendMultiValue(params, "uktzed", state.uktzed);
  appendMultiValue(params, "products", state.products);

  if (state.timeGrain) {
    params.set("timeGrain", state.timeGrain);
  }

  return params;
}

export function buildSuppliersTableSearchParams(
  state: OverviewFilterState,
): URLSearchParams {
  const params = buildSuppliersBaseSearchParams(state);

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

export async function getSuppliersDashboardRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<SuppliersDashboardResponse> {
  return requestJson<SuppliersDashboardResponse>({
    path: buildRequestPath(
      "/api/analytics/suppliers",
      buildSuppliersBaseSearchParams(state),
    ),
    accessToken,
  });
}

export async function getSuppliersTableRequest({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string;
}): Promise<SuppliersTableResponse> {
  return requestJson<SuppliersTableResponse>({
    path: buildRequestPath(
      "/api/analytics/suppliers/table",
      buildSuppliersTableSearchParams(state),
    ),
    accessToken,
  });
}

export async function getSuppliersFilterOptionsRequest({
  state,
  dimension,
  search,
  page = 1,
  limit = 10,
  accessToken,
}: {
  state: OverviewFilterState;
  dimension: SuppliersFilterOptionsDimension;
  search?: string;
  page?: number;
  limit?: number;
  accessToken: string;
}): Promise<SuppliersFilterOptionsResponse> {
  const params = buildSuppliersBaseSearchParams(state);
  params.set("dimension", dimension);
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return requestJson<SuppliersFilterOptionsResponse>({
    path: buildRequestPath("/api/analytics/suppliers/filter-options", params),
    accessToken,
  });
}

export async function exportSuppliersRequest({
  state,
  format,
  accessToken,
}: {
  state: OverviewFilterState;
  format: OverviewExportFormat;
  accessToken: string;
}): Promise<OverviewExportResult> {
  const params = buildSuppliersBaseSearchParams(state);
  params.set("format", format);

  const { blob, headers } = await requestBlob({
    path: buildRequestPath("/api/analytics/suppliers/export", params),
    accessToken,
  });

  return {
    blob,
    fileName:
      getFileNameFromDisposition(headers.get("content-disposition")) ??
      `suppliers-report-${state.dateFrom}-${state.dateTo}.${format}`,
    contentType: headers.get("content-type") ?? blob.type,
  };
}
