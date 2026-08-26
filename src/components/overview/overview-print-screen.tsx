import type { RefObject } from "react";
import { LayoutDashboardIcon } from "lucide-react";

import { OverviewKpiGrid } from "@/components/overview/overview-kpi-grid";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverviewMarketStructureCard } from "@/components/overview/overview-market-structure-card";
import { OverviewTopCardsGrid } from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";
import { Card, CardContent } from "@/components/ui/card";
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

function formatFilterSummary(
  state: OverviewFilterState,
  labels?: {
    buyerRegions?: Record<string, string>;
    buyers?: Record<string, string>;
    suppliers?: Record<string, string>;
  },
) {
  const items: Array<{ label: string; value: string[] }> = [
    {
      label: "Період",
      value: [formatDateRange(state.dateFrom, state.dateTo)],
    },
  ];

  if (state.comparisonMode === "PREVIOUS_PERIOD") {
    items.push({
      label: "Порівняння",
      value: ["Той самий вибраний період, попередній рік"],
    });
  }

  if (
    state.comparisonMode === "CUSTOM" &&
    state.compareDateFrom &&
    state.compareDateTo
  ) {
    items.push({
      label: "Порівняння",
      value: [formatDateRange(state.compareDateFrom, state.compareDateTo)],
    });
  }

  if (state.uktzed.length) {
    items.push({
      label: "УКТЗЕД",
      value: state.uktzed,
    });
  }

  if (state.products.length) {
    items.push({
      label: "Продукти",
      value: state.products,
    });
  }

  if (state.buyerRegionCodes.length) {
    items.push({
      label: "Регіони покупця",
      value: state.buyerRegionCodes.map(
        (value) => labels?.buyerRegions?.[value] ?? value,
      ),
    });
  }

  if (state.buyerTaxNumbers.length) {
    items.push({
      label: "Покупці",
      value: state.buyerTaxNumbers.map(
        (value) => labels?.buyers?.[value] ?? value,
      ),
    });
  }

  if (state.supplierTaxNumbers.length) {
    items.push({
      label: "Постачальники",
      value: state.supplierTaxNumbers.map(
        (value) => labels?.suppliers?.[value] ?? value,
      ),
    });
  }

  if (state.timeGrain) {
    const labels = {
      MONTH: "Місяць",
      QUARTER: "Квартал",
      YEAR: "Рік",
    } as const;

    items.push({
      label: "Групування",
      value: [labels[state.timeGrain]],
    });
  }

  return items;
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
  const summaryItems = formatFilterSummary(state, filterLabels);
  const primarySummaryMap = new Map(
    summaryItems
      .filter((item) => item.label === "Період" || item.label === "Порівняння")
      .map((item) => [item.label, item]),
  );
  const secondarySummaryMap = new Map(
    summaryItems
      .filter((item) => item.label !== "Період" && item.label !== "Порівняння")
      .map((item) => [item.label, item]),
  );
  const primarySummaryItems = [
    primarySummaryMap.get("Період"),
    primarySummaryMap.get("Порівняння"),
    undefined,
  ];
  const secondarySummaryItems = [
    secondarySummaryMap.get("Постачальники"),
    secondarySummaryMap.get("Покупці"),
    secondarySummaryMap.get("Регіони покупця"),
    secondarySummaryMap.get("УКТЗЕД"),
    secondarySummaryMap.get("Продукти"),
    secondarySummaryMap.get("Групування"),
  ].filter(Boolean);

  return (
    <section
      ref={reportRef}
      className="print-report mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-4 bg-background px-4 py-5 md:px-6"
    >
      <Card className="print-section border border-border/70 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutDashboardIcon className="size-5" />
              </div>
              <div className="flex min-h-11 flex-col justify-center">
                <p className="print-text text-lg font-semibold leading-none text-foreground">
                  TradeMatrix
                </p>
                <p className="print-text mt-1 text-sm leading-none text-muted-foreground">
                  Overview dashboard report
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {primarySummaryItems.map((item, index) =>
              item ? (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-md border border-border/70 bg-muted/10 px-3 py-2.5"
                >
                  <p className="print-text text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="mt-1 space-y-1">
                    {item.value.map((line, lineIndex) => (
                      <p
                        key={`${item.label}-${lineIndex}`}
                        className="print-text text-sm text-foreground"
                        style={{ color: "#18181b" }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={`summary-spacer-${index}`} />
              ),
            )}
          </div>

          {secondarySummaryItems.length ? (
            <div className="grid grid-cols-3 gap-2">
              {secondarySummaryItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-md border border-border/70 bg-muted/10 px-3 py-2.5"
                >
                  <p className="print-text text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="mt-1 space-y-1">
                    {item.value.map((line, index) => (
                      <p
                        key={`${item.label}-${index}`}
                        className="print-text text-sm text-foreground"
                        style={{ color: "#18181b" }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

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
    </section>
  );
}
