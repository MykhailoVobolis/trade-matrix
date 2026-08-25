"use client";

import { startTransition, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductsDashboardScreen } from "@/components/products/products-dashboard-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import type { OverviewExportFormat } from "@/lib/overview/overview-api";
import {
  getDefaultProductsFilterState,
  normalizeProductsFilterState,
  parseProductsSearchParams,
  persistProductsFilterState,
  readPersistedProductsFilterState,
  serializeProductsSearchParams,
} from "@/lib/products/products-url-state";
import { exportProductsRequest } from "@/lib/products/products-api";
import {
  useProductsDashboardQuery,
  useProductsTableQuery,
} from "@/lib/products/products-query";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeProductsSearchParams(state);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function ProductsDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const parsedState = useMemo(
    () => parseProductsSearchParams(searchParams),
    [searchParams],
  );
  const searchParamsString = searchParams.toString();
  const persistedState = useMemo(
    () =>
      typeof window !== "undefined" && !searchParamsString
        ? readPersistedProductsFilterState()
        : null,
    [searchParamsString],
  );
  const state = persistedState ?? parsedState;

  useEffect(() => {
    persistProductsFilterState(state);
  }, [state]);

  useEffect(() => {
    if (searchParamsString || !persistedState) {
      return;
    }

    startTransition(() => {
      router.replace(createUrl(pathname, persistedState), { scroll: false });
    });
  }, [pathname, persistedState, router, searchParamsString]);

  const dashboardQuery = useProductsDashboardQuery({
    state,
    accessToken,
  });
  const tableQuery = useProductsTableQuery({
    state,
    accessToken,
  });
  const exportMutation = useMutation({
    mutationFn: async (format: OverviewExportFormat) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return exportProductsRequest({
        state,
        format,
        accessToken,
      });
    },
    onSuccess: ({ blob, fileName }) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    },
  });

  function replaceState(nextState: OverviewFilterState) {
    const normalizedState = normalizeProductsFilterState(nextState);
    persistProductsFilterState(normalizedState);

    startTransition(() => {
      router.replace(createUrl(pathname, normalizedState), { scroll: false });
    });
  }

  function updateFilters(patch: Partial<OverviewFilterValues>) {
    replaceState({
      ...state,
      ...patch,
      table: {
        ...state.table,
        page: 1,
      },
    });
  }

  function updateTableState(patch: Partial<OverviewTableState>) {
    replaceState({
      ...state,
      table: {
        ...state.table,
        ...patch,
      },
    });
  }

  function resetFilters() {
    replaceState(getDefaultProductsFilterState());
  }

  return (
    <ProductsDashboardScreen
      state={state}
      accessToken={accessToken}
      dashboard={dashboardQuery.data}
      table={tableQuery.data}
      isDashboardLoading={dashboardQuery.isLoading}
      isDashboardFetching={dashboardQuery.isFetching}
      dashboardError={dashboardQuery.error?.message ?? null}
      isTableLoading={tableQuery.isLoading}
      isTableFetching={tableQuery.isFetching}
      tableError={tableQuery.error?.message ?? null}
      onUpdateFilters={updateFilters}
      onUpdateTableState={updateTableState}
      onResetFilters={resetFilters}
      onRetryDashboard={() => {
        void dashboardQuery.refetch();
      }}
      onRetryTable={() => {
        void tableQuery.refetch();
      }}
      onExport={(format) => exportMutation.mutate(format)}
      isExportPending={exportMutation.isPending}
    />
  );
}
