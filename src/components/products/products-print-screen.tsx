import type { RefObject } from "react";
import {
  BarChart3Icon,
  Building2Icon,
  MapPinnedIcon,
  PackageIcon,
  TrophyIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import {
  DashboardPrintInsights,
  DashboardPrintKpiGrid,
  DashboardPrintStructure,
  DashboardPrintSummary,
  type PrintSummaryItem,
} from "@/components/pdf/dashboard-print-primitives";
import {
  OverviewTopCardsGrid,
  type OverviewTopCardDefinition,
} from "@/components/overview/overview-top-cards-grid";
import { OverviewTrendCard } from "@/components/overview/overview-trend-card";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";
import { formatCompactCurrency } from "@/lib/overview/overview-format";
import type { ProductsDashboardResponse } from "@/lib/products/products-api";

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
    buyers?: Record<string, string>;
    suppliers?: Record<string, string>;
    buyerRegions?: Record<string, string>;
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
  } else if (
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

  if (state.products.length) {
    secondaryItems.push({ label: "Продукти", value: state.products });
  }

  if (state.uktzed.length) {
    secondaryItems.push({ label: "УКТЗЕД", value: state.uktzed });
  }

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

  if (state.timeGrain) {
    const timeGrainLabels = {
      MONTH: "Місяць",
      QUARTER: "Квартал",
      YEAR: "Рік",
    } as const;

    secondaryItems.push({
      label: "Групування",
      value: [timeGrainLabels[state.timeGrain]],
    });
  }

  return { primaryItems, secondaryItems };
}

function buildTopCards(): OverviewTopCardDefinition[] {
  return [
    {
      title: "Топ покупців",
      sheetTitle: "Усі покупці",
      columns: ["Покупець", "Продажі з ПДВ", "Частка"],
      icon: UsersIcon,
      iconClassName: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Топ постачальників",
      sheetTitle: "Усі постачальники",
      columns: ["Постачальник", "Продажі з ПДВ", "Частка"],
      icon: Building2Icon,
      iconClassName: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: "Топ продуктів",
      sheetTitle: "Усі продукти",
      columns: ["Продукт / Номенклатура", "Продажі з ПДВ", "Частка"],
      icon: PackageIcon,
      iconClassName: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Топ регіонів збуту",
      sheetTitle: "Усі регіони збуту",
      columns: ["Регіон покупця", "Продажі з ПДВ", "Частка"],
      icon: MapPinnedIcon,
      iconClassName: "bg-amber-500/10 text-amber-600",
    },
  ];
}

export function ProductsPrintScreen({
  reportRef,
  state,
  dashboard,
  isLoading,
  isFetching,
  error,
  filterLabels,
  onRetry,
}: {
  reportRef?: RefObject<HTMLElement | null>;
  state: OverviewFilterState;
  dashboard?: ProductsDashboardResponse;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filterLabels?: {
    buyers?: Record<string, string>;
    suppliers?: Record<string, string>;
    buyerRegions?: Record<string, string>;
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
      subtitle="Products dashboard report"
      primaryItems={primaryItems}
      secondaryItems={secondaryItems}
      error={error}
    >
      <DashboardPrintKpiGrid
        cards={[
          {
            title: "Продажі з ПДВ",
            icon: BarChart3Icon,
            accent: "blue",
            kind: "currency",
          },
          {
            title: "Активні покупці",
            icon: UsersIcon,
            accent: "blue",
            kind: "number",
          },
          {
            title: "Активні постачальники",
            icon: Building2Icon,
            accent: "cyan",
            kind: "number",
          },
          {
            title: "Регіони збуту",
            icon: MapPinnedIcon,
            accent: "amber",
            kind: "number",
          },
        ]}
        metrics={
          dashboard
            ? [
                dashboard.kpi.salesWithVat,
                dashboard.kpi.activeBuyers,
                dashboard.kpi.activeSuppliers,
                dashboard.kpi.salesRegions,
              ]
            : []
        }
        isLoading={isLoading}
        error={error}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        onRetry={onRetry}
      />

      <div className="print-section">
        <OverviewTrendCard
          trend={(dashboard?.trend ?? []).map((item) => ({
            periodStart: item.periodStart,
            periodLabel: item.periodLabel,
            salesWithVat: item.salesWithVat,
            purchasesWithVat: 0,
            comparisonSalesWithVat: item.comparisonSalesWithVat,
            comparisonPurchasesWithVat: null,
          }))}
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

      <DashboardPrintStructure
        title="Структура продажів"
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        items={[
          {
            title: "Топ постачальник",
            icon: Building2Icon,
            accent: "cyan",
            primary: dashboard?.marketStructure.topSupplier?.name ?? null,
            tertiary: dashboard?.marketStructure.topSupplier?.id
              ? `ЄДРПОУ ${dashboard.marketStructure.topSupplier.id}`
              : null,
            secondary: dashboard?.marketStructure.topSupplier
              ? `${formatCompactCurrency(dashboard.marketStructure.topSupplier.amount)} • ${dashboard.marketStructure.topSupplier.share.toFixed(1)}%`
              : null,
          },
          {
            title: "Топ покупець",
            icon: UsersIcon,
            accent: "blue",
            primary: dashboard?.marketStructure.topBuyer?.name ?? null,
            tertiary: dashboard?.marketStructure.topBuyer?.id
              ? `ЄДРПОУ ${dashboard.marketStructure.topBuyer.id}`
              : null,
            secondary: dashboard?.marketStructure.topBuyer
              ? `${formatCompactCurrency(dashboard.marketStructure.topBuyer.amount)} • ${dashboard.marketStructure.topBuyer.share.toFixed(1)}%`
              : null,
          },
          {
            title: "Топ регіон збуту",
            icon: MapPinnedIcon,
            accent: "amber",
            primary:
              dashboard?.marketStructure.topBuyerRegion?.regionName?.trim() ||
              "Не визначено",
            secondary: dashboard?.marketStructure.topBuyerRegion
              ? `${formatCompactCurrency(dashboard.marketStructure.topBuyerRegion.amount)} • ${dashboard.marketStructure.topBuyerRegion.share.toFixed(1)}%`
              : null,
          },
          {
            title: "Частка TOP-5 постачальників",
            icon: TrophyIcon,
            accent: "cyan",
            primary:
              dashboard?.marketStructure.top5SuppliersShare != null
                ? `${dashboard.marketStructure.top5SuppliersShare.toFixed(1)}% від продажів`
                : null,
          },
          {
            title: "Частка TOP-5 покупців",
            icon: TrophyIcon,
            accent: "blue",
            primary:
              dashboard?.marketStructure.top5BuyersShare != null
                ? `${dashboard.marketStructure.top5BuyersShare.toFixed(1)}% від продажів`
                : null,
          },
          {
            title: "Частка TOP-5 регіонів збуту",
            icon: MapPinnedIcon,
            accent: "amber",
            primary:
              dashboard?.marketStructure.top5RegionsShare != null
                ? `${dashboard.marketStructure.top5RegionsShare.toFixed(1)}% від продажів`
                : null,
          },
        ]}
      />

      <DashboardPrintInsights
        title="Ринкові інсайти"
        items={[
          {
            icon: TrendingUpIcon,
            accent: "blue",
            text:
              dashboard?.insights.find((item) => item.type === "SALES_CHANGE")
                ?.payload.deltaPercent != null
                ? `Продажі змінились на ${dashboard.insights.find((item) => item.type === "SALES_CHANGE")?.payload.deltaPercent}% порівняно з попереднім періодом`
                : "Продажі змінились на —% порівняно з попереднім періодом",
            muted:
              dashboard?.insights.find((item) => item.type === "SALES_CHANGE")
                ?.payload.deltaPercent == null,
          },
          {
            icon: TrendingUpIcon,
            accent: "blue",
            text:
              dashboard?.insights.find(
                (item) => item.type === "PEAK_SALES_PERIOD",
              )?.payload.periodLabel != null
                ? `Пік продажів — ${dashboard.insights.find((item) => item.type === "PEAK_SALES_PERIOD")?.payload.periodLabel}`
                : "Пік продажів — —",
            muted:
              dashboard?.insights.find(
                (item) => item.type === "PEAK_SALES_PERIOD",
              )?.payload.periodLabel == null,
          },
          {
            icon: MapPinnedIcon,
            accent: "amber",
            text: `Найбільший регіон попиту — ${dashboard?.insights.find((item) => item.type === "TOP_REGION")?.payload.regionName ?? "—"}`,
            muted:
              dashboard?.insights.find((item) => item.type === "TOP_REGION")
                ?.payload.regionName == null,
          },
        ]}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      />

      <OverviewTopCardsGrid
        state={state}
        accessToken={null}
        topBuyers={dashboard?.topBuyers ?? []}
        topSuppliers={dashboard?.topSuppliers ?? []}
        topProducts={dashboard?.topProducts ?? []}
        topRegions={dashboard?.topRegions ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        printMode
        cardsOverride={buildTopCards()}
        rowsOverride={[
          dashboard?.topBuyers ?? [],
          dashboard?.topSuppliers ?? [],
          dashboard?.topProducts ?? [],
          dashboard?.topRegions ?? [],
        ]}
        secondaryTextResolver={(item, cardIndex) => {
          if (
            (cardIndex === 0 || cardIndex === 1) &&
            "id" in item &&
            typeof item.id === "string" &&
            item.id.trim()
          ) {
            return `ЄДРПОУ ${item.id}`;
          }

          if (cardIndex === 2 && "uktzed" in item && item.uktzed) {
            return `УКТЗЕД ${item.uktzed}`;
          }

          if (
            cardIndex === 3 &&
            "activeBuyers" in item &&
            typeof item.activeBuyers === "number"
          ) {
            return `${item.activeBuyers} активних покупців`;
          }

          return null;
        }}
      />
    </DashboardPrintSummary>
  );
}
