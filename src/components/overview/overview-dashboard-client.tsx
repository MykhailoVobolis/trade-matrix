"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { OverviewDashboardScreen } from "@/components/overview/overview-dashboard-screen";
import { OverviewPrintScreen } from "@/components/overview/overview-print-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  exportDashboardPdf,
  exportThemeVariables,
} from "@/lib/pdf/dashboard-pdf-export";
import {
  exportOverviewRequest,
  getOverviewFilterOptionsRequest,
  type OverviewExportFormat,
  type OverviewFilterOptionsDimension,
} from "@/lib/overview/overview-api";
import {
  useOverviewQuery,
  useOverviewTableQuery,
} from "@/lib/overview/overview-query";
import {
  getDefaultOverviewFilterState,
  normalizeOverviewFilterState,
  parseOverviewSearchParams,
  persistOverviewFilterState,
  readPersistedOverviewFilterState,
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

type OverviewPrintFilterLabels = {
  buyerRegions: Record<string, string>;
  buyers: Record<string, string>;
  suppliers: Record<string, string>;
};

async function resolveFilterLabels(
  state: OverviewFilterState,
  accessToken: string,
): Promise<OverviewPrintFilterLabels> {
  const result: OverviewPrintFilterLabels = {
    buyerRegions: {},
    buyers: {},
    suppliers: {},
  };

  const tasks: Array<Promise<void>> = [];

  function queueDimension(
    dimension: OverviewFilterOptionsDimension,
    values: string[],
    target: keyof OverviewPrintFilterLabels,
  ) {
    for (const value of values) {
      tasks.push(
        getOverviewFilterOptionsRequest({
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

export function OverviewDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const parsedState = useMemo(
    () => parseOverviewSearchParams(searchParams),
    [searchParams],
  );
  const searchParamsString = searchParams.toString();
  const persistedState = useMemo(
    () =>
      typeof window !== "undefined" && !searchParamsString
        ? readPersistedOverviewFilterState()
        : null,
    [searchParamsString],
  );
  const state = persistedState ?? parsedState;

  useEffect(() => {
    persistOverviewFilterState(state);
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

  const overviewQuery = useOverviewQuery({
    state,
    accessToken,
  });
  const overviewTableQuery = useOverviewTableQuery({
    state,
    accessToken,
  });
  const exportReportRef = useRef<HTMLElement | null>(null);
  const [isPdfExportPending, setIsPdfExportPending] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] =
    useState<OverviewExportFormat | null>(null);
  const [pdfExportError, setPdfExportError] = useState<string | null>(null);
  const [printFilterLabels, setPrintFilterLabels] =
    useState<OverviewPrintFilterLabels>({
      buyerRegions: {},
      buyers: {},
      suppliers: {},
    });
  const exportMutation = useMutation({
    mutationFn: async (format: OverviewExportFormat) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return exportOverviewRequest({
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
    onSettled: () => {
      setPendingExportFormat(null);
    },
  });

  function replaceState(nextState: OverviewFilterState) {
    persistOverviewFilterState(nextState);

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

  async function exportPdf() {
    if (!exportReportRef.current || isPdfExportPending || !accessToken) {
      return;
    }

    setIsPdfExportPending(true);
    setPdfExportError(null);

    try {
      const exportNode = exportReportRef.current;

      if (!exportNode) {
        throw new Error("PDF export container is unavailable.");
      }

      const resolvedLabels = await resolveFilterLabels(state, accessToken);
      flushSync(() => {
        setPrintFilterLabels(resolvedLabels);
      });

      await exportDashboardPdf({
        exportNode,
        fileName: `overview-report-${state.dateFrom}-${state.dateTo}.pdf`,
      });
    } catch (error) {
      setPdfExportError(
        error instanceof Error ? error.message : "Не вдалося сформувати PDF.",
      );
    } finally {
      setIsPdfExportPending(false);
    }
  }

  return (
    <>
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
        onRetryOverview={() => {
          void overviewQuery.refetch();
        }}
        onRetryOverviewTable={() => {
          void overviewTableQuery.refetch();
        }}
        onUpdateOverviewFilters={updateOverviewFilters}
        onUpdateTableState={updateTableState}
        onResetFilters={resetFilters}
        onExportPdf={() => {
          void exportPdf();
        }}
        isPdfExportPending={isPdfExportPending}
        pdfExportError={pdfExportError}
        onExport={(format) => {
          setPendingExportFormat(format);
          exportMutation.mutate(format);
        }}
        isExportPending={exportMutation.isPending}
        pendingExportFormat={pendingExportFormat}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-[-200vw] z-[-1] w-[1120px] overflow-hidden bg-background"
        style={exportThemeVariables}
      >
        <OverviewPrintScreen
          reportRef={exportReportRef}
          state={state}
          overview={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
          isFetching={overviewQuery.isFetching}
          error={overviewQuery.error?.message ?? null}
          filterLabels={printFilterLabels}
          onRetry={() => {
            void overviewQuery.refetch();
          }}
        />
      </div>
    </>
  );
}
