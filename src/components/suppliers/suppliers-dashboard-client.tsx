"use client";

import { startTransition, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SuppliersDashboardScreen } from "@/components/suppliers/suppliers-dashboard-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { exportSuppliersRequest } from "@/lib/suppliers/suppliers-api";
import {
  useSuppliersDashboardQuery,
  useSuppliersTableQuery,
} from "@/lib/suppliers/suppliers-query";
import {
  getDefaultSuppliersFilterState,
  normalizeSuppliersFilterState,
  parseSuppliersSearchParams,
  persistSuppliersFilterState,
  readPersistedSuppliersFilterState,
  serializeSuppliersSearchParams,
} from "@/lib/suppliers/suppliers-url-state";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";
import type { OverviewExportFormat } from "@/lib/overview/overview-api";

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeSuppliersSearchParams(state);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function SuppliersDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const parsedState = useMemo(
    () => parseSuppliersSearchParams(searchParams),
    [searchParams],
  );
  const searchParamsString = searchParams.toString();
  const persistedState = useMemo(
    () =>
      typeof window !== "undefined" && !searchParamsString
        ? readPersistedSuppliersFilterState()
        : null,
    [searchParamsString],
  );
  const state = persistedState ?? parsedState;

  useEffect(() => {
    persistSuppliersFilterState(state);
  }, [state]);

  useEffect(() => {
    if (searchParamsString || !persistedState) {
      return;
    }

    startTransition(() => {
      router.replace(createUrl(pathname, persistedState), {
        scroll: false,
      });
    });
  }, [pathname, persistedState, router, searchParamsString]);

  const dashboardQuery = useSuppliersDashboardQuery({
    state,
    accessToken,
  });
  const tableQuery = useSuppliersTableQuery({
    state,
    accessToken,
  });
  const exportMutation = useMutation({
    mutationFn: async (format: OverviewExportFormat) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return exportSuppliersRequest({
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
    const normalizedState = normalizeSuppliersFilterState(nextState);
    persistSuppliersFilterState(normalizedState);

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
    replaceState(getDefaultSuppliersFilterState());
  }

  return (
    <SuppliersDashboardScreen
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
