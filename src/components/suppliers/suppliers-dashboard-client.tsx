"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SuppliersDashboardScreen } from "@/components/suppliers/suppliers-dashboard-screen";
import { SuppliersPrintScreen } from "@/components/suppliers/suppliers-print-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  exportDashboardPdf,
  exportThemeVariables,
} from "@/lib/pdf/dashboard-pdf-export";
import {
  exportSuppliersRequest,
  getSuppliersFilterOptionsRequest,
  type SuppliersFilterOptionsDimension,
} from "@/lib/suppliers/suppliers-api";
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

type SuppliersPrintFilterLabels = {
  buyerRegions: Record<string, string>;
  buyers: Record<string, string>;
  suppliers: Record<string, string>;
};

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeSuppliersSearchParams(state);
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

async function resolveFilterLabels(
  state: OverviewFilterState,
  accessToken: string,
): Promise<SuppliersPrintFilterLabels> {
  const result: SuppliersPrintFilterLabels = {
    buyerRegions: {},
    buyers: {},
    suppliers: {},
  };
  const tasks: Array<Promise<void>> = [];

  function queueDimension(
    dimension: SuppliersFilterOptionsDimension,
    values: string[],
    target: keyof SuppliersPrintFilterLabels,
  ) {
    for (const value of values) {
      tasks.push(
        getSuppliersFilterOptionsRequest({
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
  const exportReportRef = useRef<HTMLElement | null>(null);
  const [isPdfExportPending, setIsPdfExportPending] = useState(false);
  const [printFilterLabels, setPrintFilterLabels] =
    useState<SuppliersPrintFilterLabels>({
      buyerRegions: {},
      buyers: {},
      suppliers: {},
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
        fileName: `suppliers-report-${state.dateFrom}-${state.dateTo}.pdf`,
      });
    } finally {
      setIsPdfExportPending(false);
    }
  }

  return (
    <>
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
        <SuppliersPrintScreen
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
