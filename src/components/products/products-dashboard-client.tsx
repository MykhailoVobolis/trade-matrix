"use client";

import { startTransition, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductsDashboardScreen } from "@/components/products/products-dashboard-screen";
import {
  getDefaultProductsFilterState,
  normalizeProductsFilterState,
  parseProductsSearchParams,
  persistProductsFilterState,
  readPersistedProductsFilterState,
  serializeProductsSearchParams,
} from "@/lib/products/products-url-state";
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
      onUpdateFilters={updateFilters}
      onUpdateTableState={updateTableState}
      onResetFilters={resetFilters}
    />
  );
}
