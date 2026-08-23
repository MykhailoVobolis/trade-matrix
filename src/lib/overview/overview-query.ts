import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  buildOverviewBaseSearchParams,
  buildOverviewTableSearchParams,
  getOverviewFilterOptionsRequest,
  getOverviewRequest,
  getOverviewTableRequest,
  type OverviewFilterOptionsDimension,
  type OverviewFilterOptionsResponse,
  type OverviewResponse,
  type OverviewTableResponse,
} from "@/lib/overview/overview-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

export const overviewQueryKeys = {
  all: ["overview"] as const,
  dashboard: (state: OverviewFilterState) =>
    [
      "overview",
      "dashboard",
      buildOverviewBaseSearchParams(state).toString(),
    ] as const,
  table: (state: OverviewFilterState) =>
    [
      "overview",
      "table",
      buildOverviewTableSearchParams(state).toString(),
    ] as const,
  filterOptions: ({
    state,
    dimension,
    search,
    page,
    limit,
  }: {
    state: OverviewFilterState;
    dimension: OverviewFilterOptionsDimension;
    search: string;
    page: number;
    limit: number;
  }) =>
    [
      "overview",
      "filter-options",
      dimension,
      search,
      page,
      limit,
      buildOverviewBaseSearchParams(state).toString(),
    ] as const,
};

export function useOverviewQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<OverviewResponse>({
    queryKey: overviewQueryKeys.dashboard(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getOverviewRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useOverviewTableQuery({
  state,
  accessToken,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  return useQuery<OverviewTableResponse>({
    queryKey: overviewQueryKeys.table(state),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getOverviewTableRequest({
        state,
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}

export function useOverviewFilterOptionsQuery({
  state,
  dimension,
  search,
  page = 1,
  limit = 10,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: OverviewFilterOptionsDimension;
  search: string;
  page?: number;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useQuery<OverviewFilterOptionsResponse>({
    queryKey: overviewQueryKeys.filterOptions({
      state,
      dimension,
      search,
      page,
      limit,
    }),
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getOverviewFilterOptionsRequest({
        state,
        dimension,
        search,
        page,
        limit,
        accessToken,
      });
    },
    enabled: Boolean(accessToken) && enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useOverviewFilterOptionsInfiniteQuery({
  state,
  dimension,
  search,
  limit = 50,
  accessToken,
  enabled = true,
}: {
  state: OverviewFilterState;
  dimension: OverviewFilterOptionsDimension;
  search: string;
  limit?: number;
  accessToken: string | null;
  enabled?: boolean;
}) {
  return useInfiniteQuery<OverviewFilterOptionsResponse>({
    queryKey: overviewQueryKeys.filterOptions({
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

      return getOverviewFilterOptionsRequest({
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
