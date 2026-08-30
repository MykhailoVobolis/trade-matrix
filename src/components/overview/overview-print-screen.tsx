import type { RefObject } from "react";

import {
  DashboardPrintSummary,
  type PrintSummaryItem,
} from "@/components/pdf/dashboard-print-primitives";
import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverviewMarketStructureCard } from "@/components/overview/overview-market-structure-card";
import { OverviewTopCardsGrid } from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";
import type { OverviewResponse } from "@/lib/overview/overview-api";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";

function formatDateRange(dateFrom: string, dateTo: string) {
  const formatter = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${formatter.format(new Date(dateFrom))} — ${formatter.format(
    new Date(dateTo),
  )}`;
}

function buildSummaryItems(
  state: OverviewFilterState,
  labels?: {
    buyerRegions?: Record<string, string>;
    buyers?: Record<string, string>;
    suppliers?: Record<string, string>;
  },
) {
  const primaryItems: PrintSummaryItem[] = [
    {
      label: "Період",
      value: [formatDateRange(state.dateFrom, state.dateTo)],
    },
  ];

  if (state.comparisonMode === "PREVIOUS_PERIOD") {
    primaryItems.push({
      label: "Порівняння",
      value: ["Той самий вибраний період, попередній рік"],
    });
  }

  if (
    state.comparisonMode === "CUSTOM" &&
    state.compareDateFrom &&
    state.compareDateTo
  ) {
    primaryItems.push({
      label: "Порівняння",
      value: [formatDateRange(state.compareDateFrom, state.compareDateTo)],
    });
  }

  const secondaryItems: PrintSummaryItem[] = [];

  if (state.supplierTaxNumbers.length) {
    secondaryItems.push({
      label: "Постачальники",
      value: state.supplierTaxNumbers.map(
        (value) => labels?.suppliers?.[value] ?? value,
      ),
    });
  }

  if (state.buyerTaxNumbers.length) {
    secondaryItems.push({
      label: "Покупці",
      value: state.buyerTaxNumbers.map(
        (value) => labels?.buyers?.[value] ?? value,
      ),
    });
  }

  if (state.buyerRegionCodes.length) {
    secondaryItems.push({
      label: "Регіони покупця",
      value: state.buyerRegionCodes.map(
        (value) => labels?.buyerRegions?.[value] ?? value,
      ),
    });
  }

  if (state.uktzed.length) {
    secondaryItems.push({
      label: "УКТЗЕД",
      value: state.uktzed,
    });
  }

  if (state.products.length) {
    secondaryItems.push({
      label: "Продукти",
      value: state.products,
    });
  }

  if (state.timeGrain) {
    const labels = {
      MONTH: "Місяць",
      QUARTER: "Квартал",
      YEAR: "Рік",
    } as const;

    secondaryItems.push({
      label: "Групування",
      value: [labels[state.timeGrain]],
    });
  }

  return { primaryItems, secondaryItems };
}

export function OverviewPrintScreen({
  reportRef,
  state,
  overview,
  isLoading,
  isFetching,
  error,
  filterLabels,
  onRetry,
}: {
  reportRef?: RefObject<HTMLElement | null>;
  state: OverviewFilterState;
  overview?: OverviewResponse;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filterLabels?: {
    buyerRegions?: Record<string, string>;
    buyers?: Record<string, string>;
    suppliers?: Record<string, string>;
  };
  onRetry: () => void;
}) {
  const { primaryItems, secondaryItems } = buildSummaryItems(
    state,
    filterLabels,
  );

  return (
    <DashboardPrintSummary
      reportRef={reportRef}
      title="TradeMatrix"
      subtitle="Overview dashboard report"
      primaryItems={primaryItems}
      secondaryItems={secondaryItems}
      error={error}
    >
      <div className="print-section">
        <OverviewKpiGrid
          kpi={overview?.kpi}
          isLoading={isLoading}
          error={error}
          comparisonEnabled={state.comparisonMode !== "NONE"}
          onRetry={onRetry}
          printMode
        />
      </div>

      <div className="print-section">
        <OverviewTrendCard
          trend={overview?.trend ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          timeGrain={state.timeGrain}
          comparisonEnabled={state.comparisonMode !== "NONE"}
          onRetry={onRetry}
          onTimeGrainChange={() => {}}
          printMode
        />
      </div>

      <div className="print-section">
        <OverviewMarketStructureCard
          data={overview?.marketStructure}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          printMode
        />
      </div>

      <div className="print-section">
        <OverviewMarketInsightsCard
          insights={overview?.insights ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          printMode
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
      </div>

      <OverviewTopCardsGrid
        state={state}
        accessToken={null}
        topBuyers={overview?.topBuyers ?? []}
        topSuppliers={overview?.topSuppliers ?? []}
        topProducts={overview?.topProducts ?? []}
        topRegions={overview?.topRegions ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        printMode
      />
    </DashboardPrintSummary>
  );
}
