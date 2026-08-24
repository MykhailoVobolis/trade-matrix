import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  buildBuyersBaseSearchParams,
  buildBuyersTableSearchParams,
  getBuyersDashboardRequest,
  getBuyersFilterOptionsRequest,
  getBuyersRankingsRequest,
  getBuyersTableRequest,
  type BuyersDashboardResponse,
  type BuyersEntityRankingsResponse,
  type BuyersFilterOptionsDimension,
  type BuyersFilterOptionsResponse,
  type BuyersProductRankingsResponse,
  type BuyersRankingDimension,
  type BuyersRegionRankingsResponse,
  type BuyersTableResponse,
} from "@/lib/buyers/buyers-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export const buyersQueryKeys = {
  all: ["buyers"] as const,
  dashboard: (state: OverviewFilterState) =>
    [
      "buyers",
      "dashboard",
      buildBuyersBaseSearchParams(state).toString(),
    ] as const,
  table: (state: OverviewFilterState) =>
    [
      "buyers",
      "table",
      buildBuyersTableSearchParams(state).toString(),
    ] as const,
  filterOptions: ({
    state,
    dimension,
    search,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: BuyersFilterOptionsDimension;
    search: string;
    page: number;
    limit: number;
  }) =>
    [
      "buyers",
      "filter-options",
      dimension,
      search,
      page,
      limit,
      buildBuyersBaseSearchParams(state).toString(),
    ] as const,
  rankings: ({
    state,
    dimension,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: BuyersRankingDimension;
    page: number;
    limit: number;
  }) =>
    [
      "buyers",
      "rankings",
      dimension,
      page,
      limit,
      buildBuyersBaseSearchParams(state).toString(),
    ] as const,
};

export function useBuyersDashboardQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<BuyersDashboardResponse>({
    queryKey: buyersQueryKeys.dashboard(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getBuyersDashboardRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useBuyersTableQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<BuyersTableResponse>({
    queryKey: buyersQueryKeys.table(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getBuyersTableRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useBuyersFilterOptionsInfiniteQuery({
  state,
  dimension,
  search,
  limit = 50,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: BuyersFilterOptionsDimension;
  search: string;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useInfiniteQuery<BuyersFilterOptionsResponse>({
    queryKey: buyersQueryKeys.filterOptions({
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

      return getBuyersFilterOptionsRequest({
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

export function useBuyersRankingsQuery({
  state,
  dimension,
  page = 1,
  limit = 10,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: BuyersRankingDimension;
  page?: number;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useQuery<
    | BuyersEntityRankingsResponse
    | BuyersProductRankingsResponse
    | BuyersRegionRankingsResponse
  >({
    queryKey: buyersQueryKeys.rankings({
      state,
      dimension,
      page,
      limit,
    }),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getBuyersRankingsRequest({
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
