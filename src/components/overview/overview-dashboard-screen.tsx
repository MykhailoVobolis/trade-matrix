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
      />
      <OverviewKpiGrid
        kpi={overview?.kpi}
        isLoading={isOverviewLoading}
        error={overviewError}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        onRetry={onRetryOverview}
      />

      <OverviewTrendCard
        trend={overview?.trend ?? []}
        isLoading={isOverviewLoading}
        isFetching={isOverviewFetching}
        error={overviewError}
        timeGrain={state.timeGrain}
        comparisonEnabled={state.comparisonMode !== "NONE"}
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
        renderEmptyAsGrid
        emptyGridCount={5}
        emptyGridTemplates={[
          "Продажі змінились на —% порівняно з попереднім періодом",
          "Пік продажів — —",
          "TOP-5 постачальників формують —% закупівель",
          "Найбільший регіон попиту — —",
          "УКТЗЕД — формує —% продажів",
        ]}
        emptyGridTypes={[
          "SALES_CHANGE",
          "PEAK_SALES_PERIOD",
          "SUPPLIER_CONCENTRATION",
          "TOP_REGION",
          "TOP_UKTZED",
        ]}
      />

      <OverviewTopCardsGrid
        state={state}
        accessToken={accessToken}
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
        onExport={onExport}
        isExportPending={isExportPending}
      />
    </section>
  );
}
