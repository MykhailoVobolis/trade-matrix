import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  buildSuppliersBaseSearchParams,
  buildSuppliersTableSearchParams,
  getSuppliersDashboardRequest,
  getSuppliersFilterOptionsRequest,
  getSuppliersRankingsRequest,
  getSuppliersTableRequest,
  type SuppliersDashboardResponse,
  type SuppliersFilterOptionsDimension,
  type SuppliersFilterOptionsResponse,
  type SuppliersRankingDimension,
  type SuppliersEntityRankingsResponse,
  type SuppliersProductRankingsResponse,
  type SuppliersRegionRankingsResponse,
  type SuppliersTableResponse,
} from "@/lib/suppliers/suppliers-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export const suppliersQueryKeys = {
  all: ["suppliers"] as const,
  dashboard: (state: OverviewFilterState) =>
    [
      "suppliers",
      "dashboard",
      buildSuppliersBaseSearchParams(state).toString(),
    ] as const,
  table: (state: OverviewFilterState) =>
    [
      "suppliers",
      "table",
      buildSuppliersTableSearchParams(state).toString(),
    ] as const,
  filterOptions: ({
    state,
    dimension,
    search,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: SuppliersFilterOptionsDimension;
    search: string;
    page: number;
    limit: number;
  }) =>
    [
      "suppliers",
      "filter-options",
      dimension,
      search,
      page,
      limit,
      buildSuppliersBaseSearchParams(state).toString(),
    ] as const,
  rankings: ({
    state,
    dimension,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: SuppliersRankingDimension;
    page: number;
    limit: number;
  }) =>
    [
      "suppliers",
      "rankings",
      dimension,
      page,
      limit,
      buildSuppliersBaseSearchParams(state).toString(),
    ] as const,
};

export function useSuppliersDashboardQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<SuppliersDashboardResponse>({
    queryKey: suppliersQueryKeys.dashboard(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getSuppliersDashboardRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useSuppliersTableQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<SuppliersTableResponse>({
    queryKey: suppliersQueryKeys.table(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getSuppliersTableRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useSuppliersFilterOptionsInfiniteQuery({
  state,
  dimension,
  search,
  limit = 50,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: SuppliersFilterOptionsDimension;
  search: string;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useInfiniteQuery<SuppliersFilterOptionsResponse>({
    queryKey: suppliersQueryKeys.filterOptions({
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

      return getSuppliersFilterOptionsRequest({
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

export function useSuppliersRankingsQuery({
  state,
  dimension,
  page = 1,
  limit = 10,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: SuppliersRankingDimension;
  page?: number;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useQuery<
    | SuppliersEntityRankingsResponse
    | SuppliersProductRankingsResponse
    | SuppliersRegionRankingsResponse
  >({
    queryKey: suppliersQueryKeys.rankings({
      state,
      dimension,
      page,
      limit,
    }),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getSuppliersRankingsRequest({
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
