"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { OverviewDashboardScreen } from "@/components/overview/overview-dashboard-screen";
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
  const state = parseOverviewSearchParams(searchParams);

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
      onUpdateOverviewFilters={updateOverviewFilters}
      onUpdateTableState={updateTableState}
      onResetFilters={resetFilters}
    />
  );
}
