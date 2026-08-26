"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductsDashboardScreen } from "@/components/products/products-dashboard-screen";
import { ProductsPrintScreen } from "@/components/products/products-print-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  exportDashboardPdf,
  exportThemeVariables,
} from "@/lib/pdf/dashboard-pdf-export";
import type { OverviewExportFormat } from "@/lib/overview/overview-api";
import {
  getDefaultProductsFilterState,
  normalizeProductsFilterState,
  parseProductsSearchParams,
  persistProductsFilterState,
  readPersistedProductsFilterState,
  serializeProductsSearchParams,
} from "@/lib/products/products-url-state";
import {
  exportProductsRequest,
  getProductsFilterOptionsRequest,
  type ProductsFilterOptionsDimension,
} from "@/lib/products/products-api";
import {
  useProductsDashboardQuery,
  useProductsTableQuery,
} from "@/lib/products/products-query";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

type ProductsPrintFilterLabels = {
  buyerRegions: Record<string, string>;
  buyers: Record<string, string>;
  suppliers: Record<string, string>;
};

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeProductsSearchParams(state);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

async function resolveFilterLabels(
  state: OverviewFilterState,
  accessToken: string,
): Promise<ProductsPrintFilterLabels> {
  const result: ProductsPrintFilterLabels = {
    buyerRegions: {},
    buyers: {},
    suppliers: {},
  };
  const tasks: Array<Promise<void>> = [];

  function queueDimension(
    dimension: ProductsFilterOptionsDimension,
    values: string[],
    target: keyof ProductsPrintFilterLabels,
  ) {
    for (const value of values) {
      tasks.push(
        getProductsFilterOptionsRequest({
          state,
          dimension,
          search: value,
          page: 1,
          limit: 20,
          accessToken,
        }).then((response) => {
          const exactMatch = response.items.find(
            (item) => item.value === value,
          );

          if (exactMatch?.label) {
            result[target][value] = exactMatch.label;
          }
        }),
      );
    }
  }

  queueDimension("buyerRegions", state.buyerRegionCodes, "buyerRegions");
  queueDimension("buyers", state.buyerTaxNumbers, "buyers");
  queueDimension("suppliers", state.supplierTaxNumbers, "suppliers");

  await Promise.all(tasks);

  return result;
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
  const exportReportRef = useRef<HTMLElement | null>(null);
  const [isPdfExportPending, setIsPdfExportPending] = useState(false);
  const [printFilterLabels, setPrintFilterLabels] =
    useState<ProductsPrintFilterLabels>({
      buyerRegions: {},
      buyers: {},
      suppliers: {},
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

  async function exportPdf() {
    if (!exportReportRef.current || isPdfExportPending || !accessToken) {
      return;
    }

    setIsPdfExportPending(true);

    try {
      const resolvedLabels = await resolveFilterLabels(state, accessToken);

      flushSync(() => {
        setPrintFilterLabels(resolvedLabels);
      });

      await exportDashboardPdf({
        exportNode: exportReportRef.current,
        fileName: `products-report-${state.dateFrom}-${state.dateTo}.pdf`,
      });
    } finally {
      setIsPdfExportPending(false);
    }
  }

  return (
    <>
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
        onExportPdf={() => {
          void exportPdf();
        }}
        isPdfExportPending={isPdfExportPending}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-[-200vw] z-[-1] w-[1120px] overflow-hidden bg-background"
        style={exportThemeVariables}
      >
        <ProductsPrintScreen
          reportRef={exportReportRef}
          state={state}
          dashboard={dashboardQuery.data}
          isLoading={dashboardQuery.isLoading}
          isFetching={dashboardQuery.isFetching}
          error={dashboardQuery.error?.message ?? null}
          filterLabels={printFilterLabels}
          onRetry={() => {
            void dashboardQuery.refetch();
          }}
        />
      </div>
    </>
  );
}
