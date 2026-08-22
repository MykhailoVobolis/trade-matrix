"use client";

import { startTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { OverviewDashboardScreen } from "@/components/overview/overview-dashboard-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { exportOverviewRequest } from "@/lib/overview/overview-api";
import {
  useOverviewQuery,
  useOverviewTableQuery,
} from "@/lib/overview/overview-query";
import {
  getDefaultOverviewFilterState,
  normalizeOverviewFilterState,
  parseOverviewSearchParams,
  serializeOverviewSearchParams,
  type OverviewFilterState,
  type OverviewFilterValues,
  type OverviewTableState,
} from "@/lib/overview/overview-url-state";

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeOverviewSearchParams(
    normalizeOverviewFilterState(state),
  );
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function OverviewDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const state = parseOverviewSearchParams(searchParams);
  const overviewQuery = useOverviewQuery({
    state,
    accessToken,
  });
  const overviewTableQuery = useOverviewTableQuery({
    state,
    accessToken,
  });
  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return exportOverviewRequest({
        state,
        format: "xlsx",
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
    startTransition(() => {
      router.replace(createUrl(pathname, nextState), { scroll: false });
    });
  }

  function updateOverviewFilters(patch: Partial<OverviewFilterValues>) {
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
    replaceState(getDefaultOverviewFilterState());
  }

  return (
    <OverviewDashboardScreen
      state={state}
      accessToken={accessToken}
      overview={overviewQuery.data}
      overviewTable={overviewTableQuery.data}
      isOverviewLoading={overviewQuery.isLoading}
      isOverviewFetching={overviewQuery.isFetching}
      overviewError={overviewQuery.error?.message ?? null}
      isOverviewTableLoading={overviewTableQuery.isLoading}
      isOverviewTableFetching={overviewTableQuery.isFetching}
      overviewTableError={overviewTableQuery.error?.message ?? null}
      onUpdateOverviewFilters={updateOverviewFilters}
      onUpdateTableState={updateTableState}
      onResetFilters={resetFilters}
      onExport={() => exportMutation.mutate()}
      isExportPending={exportMutation.isPending}
    />
  );
}
