import type { RefObject } from "react";
import {
  Building2Icon,
  MapPinnedIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  TrophyIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

import {
  DashboardPrintInsights,
  DashboardPrintKpiGrid,
  DashboardPrintStructure,
  DashboardPrintSummary,
  type PrintInsightItem,
  type PrintSummaryItem,
} from "@/components/pdf/dashboard-print-primitives";
import {
  OverviewTopCardsGrid,
  type OverviewTopCardDefinition,
} from "@/components/overview/overview-top-cards-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";
import {
  formatCompactCurrency,
  formatInsightPercent,
} from "@/lib/overview/overview-format";
import type {
  BuyersDashboardResponse,
  BuyersInsight,
} from "@/lib/buyers/buyers-api";

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

  if (state.buyerTaxNumbers.length) {
    secondaryItems.push({
      label: "Покупці",
      value: state.buyerTaxNumbers.map(
        (value) => labels?.buyers?.[value] ?? value,
      ),
    });
  }

  if (state.supplierTaxNumbers.length) {
    secondaryItems.push({
      label: "Постачальники",
      value: state.supplierTaxNumbers.map(
        (value) => labels?.suppliers?.[value] ?? value,
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
    secondaryItems.push({ label: "УКТЗЕД", value: state.uktzed });
  }

  if (state.products.length) {
    secondaryItems.push({ label: "Продукти", value: state.products });
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

function BuyersTrendTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props as TooltipProps<number, string> & {
    payload?: Array<{
      value?: number;
      dataKey?: string | number;
      name?: string;
      color?: string;
    }>;
    label?: string;
  };

  if (!active || !payload?.length) {
    return null;
  }

  const items = payload.filter((item) => typeof item.value === "number");

  if (!items.length) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-md border border-border/70 bg-background px-3 py-2 shadow-sm">
      <p className="mb-2 text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={`${item.dataKey}-${item.name}`}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span className="font-medium text-foreground">
              {formatCompactCurrency(item.value ?? null)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuyersPrintTrendCard({
  trend,
  isLoading,
  isFetching,
  error,
  comparisonEnabled,
  timeGrainLabel,
  onRetry,
}: {
  trend: BuyersDashboardResponse["trend"];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  comparisonEnabled: boolean;
  timeGrainLabel: string;
  onRetry: () => void;
}) {
  const hasComparison = trend.some(
    (item) => (item.comparisonPurchasesWithVat ?? 0) > 0,
  );
  const chartData = trend.map((item) => ({
    ...item,
    comparisonPurchasesWithVat:
      comparisonEnabled && hasComparison
        ? item.comparisonPurchasesWithVat
        : null,
  }));

  return (
    <Card
      className="print-section border border-border/70 shadow-none"
      style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/70 pb-4">
        <CardTitle className="print-text">Закупівлі за період</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="print-text rounded-md border border-border/70 bg-background px-3 py-2">
            {timeGrainLabel}
          </span>
          <span className="print-text rounded-md border border-border/70 bg-background px-3 py-2">
            Сума
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: "#0891b2" }}
            />
            <span className="print-text">Закупівлі з ПДВ</span>
          </div>
          {comparisonEnabled ? (
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="8"
                viewBox="0 0 24 8"
                aria-hidden="true"
                className="shrink-0"
              >
                <line
                  x1="0"
                  y1="4"
                  x2="24"
                  y2="4"
                  stroke="#67e8f9"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="print-text">Попер. період</span>
            </div>
          ) : null}
        </div>
        <div
          className="rounded-md border border-border/70 bg-muted/15 p-4"
          style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
        >
          {isLoading ? (
            <Skeleton className="h-[320px] w-full rounded-md" />
          ) : error ? (
            <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-sm text-destructive">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : !trend.length ? (
            <div className="print-text flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              Немає даних для відображення.
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 16, right: 8, left: 8, bottom: 20 }}
                  barCategoryGap={trend.length <= 6 ? "24%" : "18%"}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.45}
                  />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={12}
                    minTickGap={16}
                    height={56}
                  />
                  <YAxis hide />
                  <Tooltip cursor={false} content={<BuyersTrendTooltip />} />
                  <Bar
                    dataKey="purchasesWithVat"
                    name="Закупівлі з ПДВ"
                    fill="rgb(8 145 178)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={24}
                    isAnimationActive={false}
                  />
                  {comparisonEnabled && hasComparison ? (
                    <Line
                      type="monotone"
                      dataKey="comparisonPurchasesWithVat"
                      name="Закупівлі з ПДВ · попер. період"
                      stroke="rgb(8 145 178 / 0.7)"
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      dot={false}
                      activeDot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  ) : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {isFetching && !isLoading ? (
          <p className="print-text text-xs text-muted-foreground">
            Updating dashboard...
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function buildInsights(insights: BuyersInsight[]): PrintInsightItem[] {
  const purchasesChange = insights.find(
    (item) => item.type === "PURCHASES_CHANGE",
  );
  const peakPurchases = insights.find(
    (item) => item.type === "PEAK_PURCHASES_PERIOD",
  );
  const topRegion = insights.find((item) => item.type === "TOP_BUYER_REGION");

  return [
    {
      icon: TrendingUpIcon,
      accent: "cyan",
      text:
        purchasesChange?.payload.deltaPercent != null
          ? `Закупівлі змінились на ${purchasesChange.payload.deltaPercent}% порівняно з попереднім періодом`
          : "Закупівлі змінились на —% порівняно з попереднім періодом",
      muted: purchasesChange?.payload.deltaPercent == null,
    },
    {
      icon: TrendingUpIcon,
      accent: "cyan",
      text:
        peakPurchases?.payload.periodLabel && peakPurchases?.payload.amount
          ? `Пік закупівель — ${peakPurchases.payload.periodLabel}`
          : "Пік закупівель — —",
      muted: !(
        peakPurchases?.payload.periodLabel && peakPurchases?.payload.amount
      ),
    },
    {
      icon: MapPinnedIcon,
      accent: "amber",
      text: `Найбільший регіон попиту — ${topRegion?.payload.regionName ?? "—"}`,
      muted: !topRegion?.payload.regionName,
    },
  ];
}

function buildTopCards(): OverviewTopCardDefinition[] {
  return [
    {
      title: "Топ постачальників",
      sheetTitle: "Усі постачальники",
      columns: ["Постачальник", "Закупівлі з ПДВ", "Частка"],
      icon: Building2Icon,
      iconClassName: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: "Топ продуктів",
      sheetTitle: "Усі продукти",
      columns: ["Продукт / Номенклатура", "Закупівлі з ПДВ", "Частка"],
      icon: PackageIcon,
      iconClassName: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Топ регіонів збуту",
      sheetTitle: "Усі регіони збуту",
      columns: ["Регіон покупця", "Закупівлі з ПДВ", "Частка"],
      icon: MapPinnedIcon,
      iconClassName: "bg-amber-500/10 text-amber-600",
    },
  ];
}

export function BuyersPrintScreen({
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
  dashboard?: BuyersDashboardResponse;
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
  const timeGrainLabels = {
    "": "Авто",
    MONTH: "Місяць",
    QUARTER: "Квартал",
    YEAR: "Рік",
  } as const;

  return (
    <DashboardPrintSummary
      reportRef={reportRef}
      title="TradeMatrix"
      subtitle="Buyers dashboard report"
      primaryItems={primaryItems}
      secondaryItems={secondaryItems}
      error={error}
    >
      <DashboardPrintKpiGrid
        cards={[
          {
            title: "Закупівлі з ПДВ",
            icon: ShoppingCartIcon,
            accent: "cyan",
            kind: "currency",
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
          {
            title: "Товарні позиції",
            icon: PackageIcon,
            accent: "violet",
            kind: "number",
          },
        ]}
        metrics={
          dashboard
            ? [
                dashboard.kpi.purchasesWithVat,
                dashboard.kpi.activeSuppliers,
                dashboard.kpi.buyerRegions,
                dashboard.kpi.productPositions,
              ]
            : []
        }
        isLoading={isLoading}
        error={error}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        onRetry={onRetry}
      />

      <BuyersPrintTrendCard
        trend={dashboard?.trend ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        timeGrainLabel={timeGrainLabels[state.timeGrain] ?? "Авто"}
        onRetry={onRetry}
      />

      <DashboardPrintStructure
        title="Структура закупівель"
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
            title: "Топ УКТЗЕД",
            icon: TagIcon,
            accent: "violet",
            primary:
              dashboard?.marketStructure.topUKTZED?.code ??
              dashboard?.marketStructure.topUKTZED?.name ??
              null,
            secondary: dashboard?.marketStructure.topUKTZED
              ? `${formatCompactCurrency(dashboard.marketStructure.topUKTZED.amount)} • ${dashboard.marketStructure.topUKTZED.share.toFixed(1)}%`
              : null,
          },
          {
            title: "Частка TOP-5 постачальників",
            icon: TrophyIcon,
            accent: "cyan",
            primary:
              dashboard?.marketStructure.top5SuppliersShare != null
                ? `${dashboard.marketStructure.top5SuppliersShare.toFixed(1)}% від закупівель`
                : null,
          },
          {
            title: "Частка TOP-5 регіонів збуту",
            icon: TrophyIcon,
            accent: "amber",
            primary:
              dashboard?.marketStructure.top5SupplierRegionsShare != null
                ? `${dashboard.marketStructure.top5SupplierRegionsShare.toFixed(1)}% від закупівель`
                : null,
          },
          {
            title: "Частка TOP-5 продуктів",
            icon: PackageIcon,
            accent: "violet",
            primary:
              dashboard?.marketStructure.top5ProductsShare != null
                ? `${formatInsightPercent(dashboard.marketStructure.top5ProductsShare)}% від закупівель`
                : null,
          },
        ]}
      />

      <DashboardPrintInsights
        title="Ринкові інсайти"
        items={buildInsights(dashboard?.insights ?? [])}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      />

      <OverviewTopCardsGrid
        state={state}
        accessToken={null}
        topBuyers={[]}
        topSuppliers={dashboard?.topSuppliers ?? []}
        topProducts={dashboard?.topProducts ?? []}
        topRegions={dashboard?.topBuyerRegions ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        printMode
        cardsOverride={buildTopCards()}
        rowsOverride={[
          dashboard?.topSuppliers ?? [],
          dashboard?.topProducts ?? [],
          dashboard?.topBuyerRegions ?? [],
        ]}
        secondaryTextResolver={(item, cardIndex) => {
          if (
            cardIndex === 0 &&
            "id" in item &&
            typeof item.id === "string" &&
            item.id.trim()
          ) {
            return `ЄДРПОУ ${item.id}`;
          }

          if (cardIndex === 1 && "uktzed" in item && item.uktzed) {
            return `УКТЗЕД ${item.uktzed}`;
          }

          if (
            cardIndex === 2 &&
            "activeSuppliers" in item &&
            typeof item.activeSuppliers === "number"
          ) {
            return `${item.activeSuppliers} активних постачальників`;
          }

          return null;
        }}
      />
    </DashboardPrintSummary>
  );
}
