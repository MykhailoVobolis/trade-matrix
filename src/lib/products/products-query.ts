import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { OverviewFilterState } from "@/lib/overview/overview-url-state";
import {
  buildProductsBaseSearchParams,
  buildProductsTableSearchParams,
  getProductsDashboardRequest,
  getProductsFilterOptionsRequest,
  getProductsRankingsRequest,
  getProductsTableRequest,
  type ProductsDashboardResponse,
  type ProductsEntityRankingsResponse,
  type ProductsFilterOptionsDimension,
  type ProductsFilterOptionsResponse,
  type ProductsRankingDimension,
  type ProductsProductRankingsResponse,
  type ProductsRegionRankingsResponse,
  type ProductsTableResponse,
} from "@/lib/products/products-api";

export const productsQueryKeys = {
  all: ["products"] as const,
  dashboard: (state: OverviewFilterState) =>
    [
      "products",
      "dashboard",
      buildProductsBaseSearchParams(state).toString(),
    ] as const,
  table: (state: OverviewFilterState) =>
    [
      "products",
      "table",
      buildProductsTableSearchParams(state).toString(),
    ] as const,
  filterOptions: ({
    state,
    dimension,
    search,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: ProductsFilterOptionsDimension;
    search: string;
    page: number;
    limit: number;
  }) =>
    [
      "products",
      "filter-options",
      dimension,
      search,
      page,
      limit,
      buildProductsBaseSearchParams(state).toString(),
    ] as const,
  rankings: ({
    state,
    dimension,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: ProductsRankingDimension;
    page: number;
    limit: number;
  }) =>
    [
      "products",
      "rankings",
      dimension,
      page,
      limit,
      buildProductsBaseSearchParams(state).toString(),
    ] as const,
};

export function useProductsDashboardQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<ProductsDashboardResponse>({
    queryKey: productsQueryKeys.dashboard(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getProductsDashboardRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useProductsTableQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<ProductsTableResponse>({
    queryKey: productsQueryKeys.table(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getProductsTableRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useProductsFilterOptionsInfiniteQuery({
  state,
  dimension,
  search,
  limit = 50,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: ProductsFilterOptionsDimension;
  search: string;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useInfiniteQuery<ProductsFilterOptionsResponse>({
    queryKey: productsQueryKeys.filterOptions({
      state,
      dimension,
      search,
      page: 1,
      limit,
    }),
    queryFn: ({ pageParam }) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getProductsFilterOptionsRequest({
        state,
        dimension,
        search,
        page: typeof pageParam === "number" ? pageParam : 1,
        limit,
        accessToken,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.page * lastPage.limit;

      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(accessToken) && enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useProductsRankingsQuery({
  state,
  dimension,
  page = 1,
  limit = 10,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: ProductsRankingDimension;
  page?: number;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useQuery<
    | ProductsEntityRankingsResponse
    | ProductsProductRankingsResponse
    | ProductsRegionRankingsResponse
  >({
    queryKey: productsQueryKeys.rankings({
      state,
      dimension,
      page,
      limit,
    }),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getProductsRankingsRequest({
        state,
        dimension,
        page,
        limit,
        accessToken,
      });
    },
    enabled: Boolean(accessToken) && enabled,
  });
}
