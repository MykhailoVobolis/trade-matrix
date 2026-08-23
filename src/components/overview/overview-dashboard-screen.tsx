import { OverviewFilters } from "@/components/overview/overview-filters";
import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverviewMarketStructureCard } from "@/components/overview/overview-market-structure-card";
import { OverviewMarketTable } from "@/components/overview/overview-market-table";
import { OverviewTopCardsGrid } from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";
import type {
  OverviewExportFormat,
  OverviewResponse,
  OverviewTableResponse,
} from "@/lib/overview/overview-api";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

export function OverviewDashboardScreen({
  state,
  accessToken,
  overview,
  overviewTable,
  isOverviewLoading,
  isOverviewFetching,
  overviewError,
  isOverviewTableLoading,
  isOverviewTableFetching,
  overviewTableError,
  onRetryOverview,
  onRetryOverviewTable,
  onUpdateOverviewFilters,
  onUpdateTableState,
  onResetFilters,
  onExport,
  isExportPending,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  overview?: OverviewResponse;
  overviewTable?: OverviewTableResponse;
  isOverviewLoading: boolean;
  isOverviewFetching: boolean;
  overviewError: string | null;
  isOverviewTableLoading: boolean;
  isOverviewTableFetching: boolean;
  overviewTableError: string | null;
  onRetryOverview: () => void;
  onRetryOverviewTable: () => void;
  onUpdateOverviewFilters: (patch: Partial<OverviewFilterValues>) => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onResetFilters: () => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
}) {
  return (
    <section className="flex min-w-0 w-full flex-1 flex-col gap-4">
      <OverviewFilters
        state={state}
        accessToken={accessToken}
        onUpdateOverviewFilters={onUpdateOverviewFilters}
        onResetFilters={onResetFilters}
        onExport={onExport}
        isExportPending={isExportPending}
      />
      <OverviewKpiGrid
        kpi={overview?.kpi}
        isLoading={isOverviewLoading}
        error={overviewError}
        onRetry={onRetryOverview}
      />

      <OverviewTrendCard
        trend={overview?.trend ?? []}
        isLoading={isOverviewLoading}
        isFetching={isOverviewFetching}
        error={overviewError}
        timeGrain={state.timeGrain}
        onRetry={onRetryOverview}
        onTimeGrainChange={(timeGrain) =>
          onUpdateOverviewFilters({ timeGrain })
        }
      />
      <OverviewMarketStructureCard
        data={overview?.marketStructure}
        isLoading={isOverviewLoading}
        error={overviewError}
        onRetry={onRetryOverview}
      />
      <OverviewMarketInsightsCard
        insights={overview?.insights ?? []}
        isLoading={isOverviewLoading}
        error={overviewError}
        onRetry={onRetryOverview}
      />

      <OverviewTopCardsGrid
        state={state}
        topBuyers={overview?.topBuyers ?? []}
        topSuppliers={overview?.topSuppliers ?? []}
        topProducts={overview?.topProducts ?? []}
        topRegions={overview?.topRegions ?? []}
        isLoading={isOverviewLoading}
        error={overviewError}
        onRetry={onRetryOverview}
      />

      <OverviewMarketTable
        rows={overviewTable?.items ?? []}
        total={overviewTable?.total ?? 0}
        isLoading={isOverviewTableLoading}
        isFetching={isOverviewTableFetching}
        error={overviewTableError}
        tableState={state.table}
        onRetry={onRetryOverviewTable}
        onUpdateTableState={onUpdateTableState}
      />
    </section>
  );
}
