import { OverviewFilters } from "@/components/overview/overview-filters";
import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverviewMarketStructureCard } from "@/components/overview/overview-market-structure-card";
import { OverviewMarketTable } from "@/components/overview/overview-market-table";
import { OverviewTopCardsGrid } from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

export function OverviewDashboardScreen({
  state,
  onUpdateOverviewFilters,
  onUpdateTableState,
  onResetFilters,
}: {
  state: OverviewFilterState;
  onUpdateOverviewFilters: (patch: Partial<OverviewFilterValues>) => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onResetFilters: () => void;
}) {
  return (
    <section className="flex w-full flex-1 flex-col gap-4">
      <OverviewFilters
        state={state}
        onUpdateOverviewFilters={onUpdateOverviewFilters}
        onResetFilters={onResetFilters}
      />
      <OverviewKpiGrid />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)]">
        <OverviewTrendCard
          timeGrain={state.timeGrain}
          onTimeGrainChange={(timeGrain) =>
            onUpdateOverviewFilters({ timeGrain })
          }
        />
        <OverviewMarketStructureCard />
      </div>

      <OverviewTopCardsGrid />

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.7fr)]">
        <OverviewMarketInsightsCard />
        <OverviewMarketTable
          tableState={state.table}
          onUpdateTableState={onUpdateTableState}
        />
      </div>
    </section>
  );
}
