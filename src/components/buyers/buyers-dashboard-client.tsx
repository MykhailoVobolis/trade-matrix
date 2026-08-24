"use client";

import { startTransition, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BuyersDashboardScreen } from "@/components/buyers/buyers-dashboard-screen";
import {
  getDefaultBuyersFilterState,
  normalizeBuyersFilterState,
  parseBuyersSearchParams,
  persistBuyersFilterState,
  readPersistedBuyersFilterState,
  serializeBuyersSearchParams,
} from "@/lib/buyers/buyers-url-state";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeBuyersSearchParams(state);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function BuyersDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parsedState = useMemo(
    () => parseBuyersSearchParams(searchParams),
    [searchParams],
  );
  const searchParamsString = searchParams.toString();
  const persistedState = useMemo(
    () =>
      typeof window !== "undefined" && !searchParamsString
        ? readPersistedBuyersFilterState()
        : null,
    [searchParamsString],
  );
  const state = persistedState ?? parsedState;

  useEffect(() => {
    persistBuyersFilterState(state);
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

  function replaceState(nextState: OverviewFilterState) {
    const normalizedState = normalizeBuyersFilterState(nextState);
    persistBuyersFilterState(normalizedState);

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
    replaceState(getDefaultBuyersFilterState());
  }

  return (
    <BuyersDashboardScreen
      state={state}
      onUpdateFilters={updateFilters}
      onUpdateTableState={updateTableState}
      onResetFilters={resetFilters}
      onExport={() => {}}
      isExportPending={false}
    />
  );
}
