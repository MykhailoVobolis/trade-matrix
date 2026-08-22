import { OverviewFilters } from "@/components/overview/overview-filters";
import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverviewMarketStructureCard } from "@/components/overview/overview-market-structure-card";
import { OverviewMarketTable } from "@/components/overview/overview-market-table";
import { OverviewTopCardsGrid } from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";

export function OverviewDashboardScreen() {
  return (
    <section className="flex w-full flex-1 flex-col gap-4">
      <OverviewFilters />
      <OverviewKpiGrid />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)]">
        <OverviewTrendCard />
        <OverviewMarketStructureCard />
      </div>

      <OverviewTopCardsGrid />

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.7fr)]">
        <OverviewMarketInsightsCard />
        <OverviewMarketTable />
      </div>
    </section>
  );
}
