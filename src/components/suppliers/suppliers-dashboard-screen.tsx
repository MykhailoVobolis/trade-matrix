"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeOffIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LoaderCircleIcon,
  MapPinnedIcon,
  PackageIcon,
  TagIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipProps as RechartsTooltipProps,
} from "recharts";

import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { OverflowTooltipText } from "@/components/overview/overflow-tooltip-text";
import { DashboardKpiGrid } from "@/components/overview/dashboard-kpi-grid";
import { SuppliersFilters } from "@/components/suppliers/suppliers-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { OverviewExportFormat } from "@/lib/overview/overview-api";
import { buildOverviewDrilldownHref } from "@/lib/overview/overview-drilldown";
import {
  formatCompactCurrency,
  formatFullCurrency,
  formatInsightPercent,
  formatPercent,
  formatQuantity,
  formatQuantityWithUnit,
} from "@/lib/overview/overview-format";
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
  OverviewTimeGrain,
} from "@/lib/overview/overview-url-state";
import type {
  SuppliersDashboardResponse,
  SuppliersRankingDimension,
  SuppliersTableItem,
  SuppliersTableResponse,
} from "@/lib/suppliers/suppliers-api";
import { useSuppliersRankingsQuery } from "@/lib/suppliers/suppliers-query";

const timeGrainOptions: Array<{
  value: OverviewTimeGrain | "";
  label: string;
}> = [
  { value: "", label: "Авто" },
  { value: "MONTH", label: "Місяць" },
  { value: "QUARTER", label: "Квартал" },
  { value: "YEAR", label: "Рік" },
];

function SuppliersTrendTooltip(props: RechartsTooltipProps<number, string>) {
  const { active, payload, label } = props as RechartsTooltipProps<
    number,
    string
  > & {
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

  if (items.length === 0) {
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

function SuppliersTrendTick({
  x = 0,
  y = 0,
  index,
  payload,
  trendData = [],
}: {
  x?: number;
  y?: number;
  index?: number;
  payload?: {
    value?: string;
  };
  trendData?: SuppliersDashboardResponse["trend"];
}) {
  const salesWithVat =
    typeof index === "number" ? (trendData[index]?.salesWithVat ?? 0) : 0;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-medium"
      >
        {payload?.value ?? ""}
      </text>
      <text
        x={0}
        y={0}
        dy={31}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {formatCompactCurrency(salesWithVat)}
      </text>
    </g>
  );
}

const kpiCards = [
  {
    title: "Продажі з ПДВ",
    icon: BarChart3Icon,
    iconClassName: "bg-blue-500/10 text-blue-600",
    kind: "currency",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
    kind: "number",
  },
  {
    title: "Регіони збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
    kind: "number",
  },
  {
    title: "Товарні позиції",
    icon: PackageIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
    kind: "number",
  },
] as const;

const structureItems = [
  {
    title: "Топ покупець",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Топ регіон збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Топ УКТЗЕД",
    icon: TagIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Частка TOP-5 покупців",
    icon: TrophyIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Частка TOP-5 регіонів збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Частка TOP-5 продуктів",
    icon: PackageIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
] as const;

const topCards = [
  {
    title: "Топ покупців",
    sheetTitle: "Усі покупці",
    columns: ["Покупець", "Продажі з ПДВ", "Частка"],
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
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
] as const;

const suppliersTableColumnLabels: Record<string, string> = {
  period: "Період",
  buyerRegion: "Регіон покупця",
  buyer: "Покупець",
  supplier: "Постачальник",
  product: "Продукт",
  uktzed: "УКТЗЕД",
  quantity: "Кількість",
  unit: "Од.",
  priceWithVat: "Ціна з ПДВ",
  salesWithVat: "Продажі з ПДВ",
};

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

  return Array.from(pages).sort((left, right) => left - right);
}

function SuppliersRankingSheet({
  open,
  onOpenChange,
  card,
  state,
  accessToken,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: (typeof topCards)[number] | null;
  state: OverviewFilterState;
  accessToken: string | null;
}) {
  const [paginationState, setPaginationState] = useState<{
    dimension: SuppliersRankingDimension | null;
    page: number;
    limit: number;
  }>({
    dimension: null,
    page: 1,
    limit: 10,
  });

  const dimension = useMemo<SuppliersRankingDimension | null>(() => {
    if (!card) {
      return null;
    }

    if (card.title === "Топ покупців") return "buyers";
    if (card.title === "Топ продуктів") return "products";

    return "regions";
  }, [card]);
  const page =
    paginationState.dimension === dimension ? paginationState.page : 1;
  const limit =
    paginationState.dimension === dimension ? paginationState.limit : 10;

  const rankingsQuery = useSuppliersRankingsQuery({
    state,
    dimension: dimension ?? "buyers",
    page,
    limit,
    accessToken,
    enabled: open && Boolean(dimension),
  });

  const response = rankingsQuery.data;
  const items = response?.items ?? [];
  const total = response?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSummaryStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageSummaryEnd = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  function renderRow(
    item:
      | SuppliersDashboardResponse["topBuyers"][number]
      | SuppliersDashboardResponse["topProducts"][number]
      | SuppliersDashboardResponse["topRegions"][number],
  ) {
    const rawName = "regionName" in item ? item.regionName : item.name;
    const name = rawName?.trim() || "—";
    const secondaryText =
      dimension === "buyers" &&
      "id" in item &&
      typeof item.id === "string" &&
      item.id.trim()
        ? `ЄДРПОУ ${item.id}`
        : dimension === "products" && "uktzed" in item && item.uktzed
          ? `УКТЗЕД ${item.uktzed}`
          : dimension === "regions" &&
              "activeBuyers" in item &&
              typeof item.activeBuyers === "number"
            ? `${item.activeBuyers} активних покупців`
            : null;
    const href =
      dimension === "buyers"
        ? buildOverviewDrilldownHref({
            state,
            target: "buyers",
            buyerTaxNumbers:
              "id" in item && typeof item.id === "string"
                ? [item.id]
                : undefined,
          })
        : dimension === "products"
          ? buildOverviewDrilldownHref({
              state,
              target: "products",
              products:
                "name" in item &&
                typeof item.name === "string" &&
                item.name.trim()
                  ? [item.name]
                  : undefined,
            })
          : buildOverviewDrilldownHref({
              state,
              target: "regions",
              buyerRegionCodes:
                "regionCode" in item && typeof item.regionCode === "string"
                  ? [item.regionCode]
                  : undefined,
            });

    return (
      <Link
        href={href}
        key={`ranking-${name}-${item.amount}-${item.share}`}
        className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] items-center gap-4 rounded-md border border-border/60 px-3 py-3 transition-colors hover:bg-sidebar-accent/45"
      >
        <div className="min-w-0">
          <OverflowTooltipText
            text={name}
            className="block whitespace-normal break-words text-sm leading-snug text-foreground"
          />
          {secondaryText ? (
            <OverflowTooltipText
              text={secondaryText}
              className="mt-0.5 block whitespace-normal break-words text-[11px] leading-snug text-muted-foreground"
            />
          ) : null}
        </div>
        <span className="whitespace-nowrap text-sm text-foreground">
          {formatCompactCurrency(item.amount)}
        </span>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatPercent(item.share)}
        </span>
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-none p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:sm:w-[calc(100vw-2rem)] data-[side=right]:lg:w-[calc(100vw-18rem)] data-[side=right]:xl:w-[calc(100vw-19rem)]"
      >
        <SheetHeader className="gap-2 border-b border-border/70 pr-12">
          <SheetTitle>{card?.sheetTitle ?? "Рейтинг"}</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 text-[11px] font-medium text-muted-foreground">
              {(card?.columns ?? []).map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {rankingsQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] items-center gap-4 rounded-md border border-border/60 px-3 py-3"
                  >
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-[72%]" />
                      <Skeleton className="h-3.5 w-[40%]" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : rankingsQuery.error ? (
              <div className="flex min-h-full items-center justify-center py-10">
                <div className="space-y-3 text-center">
                  <p className="text-sm text-destructive">
                    {rankingsQuery.error.message}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void rankingsQuery.refetch();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : items.length ? (
              <div className="space-y-2">
                {items.map((item) => renderRow(item))}
              </div>
            ) : (
              <div className="flex min-h-full items-center justify-center py-10">
                <p className="text-sm text-muted-foreground">
                  Немає даних для поточних фільтрів.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-border/70 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Показано {pageSummaryStart}-{pageSummaryEnd} з {total}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page <= 1 || rankingsQuery.isFetching}
                  onClick={() =>
                    setPaginationState((current) => ({
                      dimension,
                      page: Math.max(1, page - 1),
                      limit:
                        current.dimension === dimension ? current.limit : 10,
                    }))
                  }
                  aria-label="Попередня сторінка"
                >
                  <ChevronLeftIcon />
                </Button>
                {pageNumbers.map((pageNumber, index) => (
                  <div key={pageNumber} className="flex items-center gap-1">
                    {index > 0 && pageNumber - pageNumbers[index - 1] > 1 ? (
                      <span className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    ) : null}
                    <Button
                      variant={pageNumber === page ? "outline" : "ghost"}
                      size="icon-sm"
                      className={
                        pageNumber === page
                          ? "border-sidebar-primary bg-background text-foreground shadow-sm dark:border-input dark:bg-input/40 dark:text-foreground dark:hover:bg-input/40"
                          : ""
                      }
                      disabled={rankingsQuery.isFetching}
                      onClick={() =>
                        setPaginationState((current) => ({
                          dimension,
                          page: pageNumber,
                          limit:
                            current.dimension === dimension
                              ? current.limit
                              : 10,
                        }))
                      }
                    >
                      {pageNumber}
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={
                    page >= totalPages ||
                    rankingsQuery.isFetching ||
                    total === 0
                  }
                  onClick={() =>
                    setPaginationState((current) => ({
                      dimension,
                      page: Math.min(totalPages, page + 1),
                      limit:
                        current.dimension === dimension ? current.limit : 10,
                    }))
                  }
                  aria-label="Наступна сторінка"
                >
                  <ChevronRightIcon />
                </Button>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setPaginationState({
                      dimension,
                      page: 1,
                      limit: Number(value),
                    });
                  }}
                >
                  <SelectTrigger className="h-8 min-w-28 rounded-lg px-3">
                    <SelectValue>{limit} / сторінка</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-1">
                    <SelectItem value="10">10 / сторінка</SelectItem>
                    <SelectItem value="20">20 / сторінка</SelectItem>
                    <SelectItem value="50">50 / сторінка</SelectItem>
                    <SelectItem value="100">100 / сторінка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TooltipValue({
  value,
  tooltip,
  className,
}: {
  value: string;
  tooltip?: string;
  className?: string;
}) {
  if (!tooltip || tooltip === "—" || tooltip === value) {
    return <span className={className}>{value}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={className}>{value}</span>} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function SuppliersKpiGrid({
  kpi,
  isLoading,
  error,
  comparisonEnabled = true,
  onRetry,
}: {
  kpi?: SuppliersDashboardResponse["kpi"];
  isLoading: boolean;
  error: string | null;
  comparisonEnabled?: boolean;
  onRetry?: () => void;
}) {
  const metrics = kpi
    ? [
        kpi.salesWithVat,
        kpi.activeBuyers,
        kpi.salesRegions,
        kpi.productPositions,
      ]
    : [];

  return (
    <DashboardKpiGrid
      cards={kpiCards}
      metrics={metrics}
      isLoading={isLoading}
      error={error}
      comparisonEnabled={comparisonEnabled}
      onRetry={onRetry}
    />
  );
}

function SuppliersTrendCard({
  trend,
  isLoading,
  isFetching,
  error,
  timeGrain,
  comparisonEnabled = true,
  onRetry,
  onTimeGrainChange,
}: {
  trend: SuppliersDashboardResponse["trend"];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  timeGrain: OverviewTimeGrain | "";
  comparisonEnabled?: boolean;
  onRetry?: () => void;
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
}) {
  const resolvedTimeGrainLabel =
    timeGrainOptions.find((option) => option.value === timeGrain)?.label ??
    "Авто";
  const hasComparisonSales = trend.some(
    (item) => (item.comparisonSalesWithVat ?? 0) > 0,
  );
  const chartData = trend.map((item) => ({
    ...item,
    comparisonSalesWithVat:
      comparisonEnabled && hasComparisonSales
        ? item.comparisonSalesWithVat
        : null,
  }));

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="print-text">Продажі за період</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={timeGrain || "__AUTO__"}
            onValueChange={(value) =>
              onTimeGrainChange(
                value === "__AUTO__" ? "" : (value as OverviewTimeGrain),
              )
            }
          >
            <SelectTrigger className="h-9 min-w-36 rounded-md">
              <SelectValue>{resolvedTimeGrainLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent className="p-1">
              {timeGrainOptions.map((option) => (
                <SelectItem
                  key={option.value || "__AUTO__"}
                  value={option.value || "__AUTO__"}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <span>Сума</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary" />
            <span className="print-text">Продажі з ПДВ</span>
          </div>
          {comparisonEnabled ? (
            <div className="flex items-center gap-2">
              <span className="h-px w-6 border-t border-dashed border-sidebar-primary/70" />
              <span className="print-text">Попер. період</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-md border border-border/70 bg-muted/15 p-4">
          {isLoading ? (
            <Skeleton className="h-[320px] w-full rounded-md" />
          ) : error ? (
            <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-sm text-destructive">
              <span>{error}</span>
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : trend.length === 0 ? (
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
                    tick={<SuppliersTrendTick trendData={chartData} />}
                  />
                  <YAxis hide />
                  <RechartsTooltip
                    cursor={false}
                    content={<SuppliersTrendTooltip />}
                  />
                  <Bar
                    dataKey="salesWithVat"
                    name="Продажі з ПДВ"
                    fill="var(--sidebar-primary)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={24}
                  />
                  {comparisonEnabled && hasComparisonSales ? (
                    <Line
                      type="monotone"
                      dataKey="comparisonSalesWithVat"
                      name="Продажі з ПДВ · попер. період"
                      stroke="color-mix(in oklab, var(--sidebar-primary) 75%, white)"
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      dot={false}
                      activeDot={{ r: 4 }}
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

function SuppliersMarketStructureCard({
  data,
  insights,
  isLoading,
  error,
  onRetry,
}: {
  data?: SuppliersDashboardResponse["marketStructure"];
  insights: SuppliersDashboardResponse["insights"];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const productConcentrationInsight = insights.find(
    (insight) => insight.type === "PRODUCT_CONCENTRATION",
  );
  const regionConcentrationInsight = insights.find(
    (insight) => insight.type === "REGION_CONCENTRATION",
  );

  const productConcentrationShare = productConcentrationInsight?.payload
    .top5Share as number | string | null | undefined;
  const regionConcentrationShare = regionConcentrationInsight?.payload
    .top5Share as number | string | null | undefined;
  const values = data
    ? [
        data.topBuyer
          ? {
              primary: data.topBuyer.name,
              secondary: `${formatCompactCurrency(data.topBuyer.amount)} • ${formatPercent(data.topBuyer.share)}`,
              tertiary:
                typeof data.topBuyer.id === "string" && data.topBuyer.id.trim()
                  ? `ЄДРПОУ ${data.topBuyer.id}`
                  : null,
            }
          : null,
        data.topBuyerRegion
          ? {
              primary:
                data.topBuyerRegion.regionName &&
                data.topBuyerRegion.regionName.trim() !== "undefined"
                  ? data.topBuyerRegion.regionName
                  : "Не визначено",
              secondary: `${formatCompactCurrency(data.topBuyerRegion.amount)} • ${formatPercent(data.topBuyerRegion.share)}`,
            }
          : null,
        data.topUKTZED
          ? {
              primary: data.topUKTZED.code ?? data.topUKTZED.name,
              secondary: `${formatCompactCurrency(data.topUKTZED.amount)} • ${formatPercent(data.topUKTZED.share)}`,
              tertiary: data.topUKTZED.description ?? null,
            }
          : null,
        data.top5BuyersShare !== null
          ? {
              primary: `${formatPercent(data.top5BuyersShare)} від продажів`,
            }
          : null,
        regionConcentrationShare !== undefined &&
        regionConcentrationShare !== null
          ? {
              primary: `${formatInsightPercent(regionConcentrationShare)}% від продажів`,
            }
          : null,
        productConcentrationShare !== undefined &&
        productConcentrationShare !== null
          ? {
              primary: `${formatInsightPercent(productConcentrationShare)}% від продажів`,
            }
          : null,
      ]
    : [];

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Структура продажів</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-border/70 pt-3.5 md:grid-cols-2 xl:grid-cols-3">
        {structureItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="max-w-[calc(100%-3.5rem)] text-xs font-medium text-muted-foreground">
                  {item.title}
                </p>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                ) : error ? (
                  <div className="space-y-2">
                    <p className="text-xs text-destructive">{error}</p>
                    {onRetry ? (
                      <Button size="xs" variant="outline" onClick={onRetry}>
                        Retry
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  (() => {
                    const value = values[index];

                    if (!value) {
                      return <p className="text-sm text-foreground">—</p>;
                    }

                    return (
                      <div className="max-w-[calc(100%-3.5rem)]">
                        <p className="break-words text-sm text-foreground">
                          {value.primary}
                        </p>
                        {"tertiary" in value && value.tertiary ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {value.tertiary}
                          </p>
                        ) : null}
                        {"secondary" in value && value.secondary ? (
                          <p
                            className={`text-xs text-muted-foreground ${
                              "tertiary" in value && value.tertiary
                                ? "mt-2"
                                : "mt-0.5"
                            }`}
                          >
                            {value.secondary}
                          </p>
                        ) : null}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SuppliersTopCardsGrid({
  state,
  accessToken,
  topBuyers,
  topProducts,
  topRegions,
  isLoading,
  error,
  onRetry,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  topBuyers: SuppliersDashboardResponse["topBuyers"];
  topProducts: SuppliersDashboardResponse["topProducts"];
  topRegions: SuppliersDashboardResponse["topRegions"];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number | null>(null);
  const rows = [topBuyers, topProducts, topRegions];
  const gridClassName =
    "grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)]";

  return (
    <>
      <div className="grid gap-4">
        {topCards.map((card, cardIndex) => (
          <Card
            key={card.title}
            className="border border-border/70 shadow-none"
          >
            <CardHeader className="gap-3 border-b border-border/70 pb-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                  >
                    <card.icon className="size-4" />
                  </span>
                  <CardTitle className="text-[1.05rem]">{card.title}</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSheetIndex(cardIndex)}
                  className="text-xs font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
                >
                  Переглянути всі
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-3.5">
              <div
                className={`grid ${gridClassName} gap-4 px-1 text-[11px] font-medium text-muted-foreground`}
              >
                {card.columns.map((column) => (
                  <span key={column}>{column}</span>
                ))}
              </div>

              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className={`grid ${gridClassName} items-center gap-4 border-b border-border/60 px-1 py-2 last:border-b-0`}
                  >
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : error ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">{error}</p>
                  {onRetry ? (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              ) : rows[cardIndex].length ? (
                rows[cardIndex].slice(0, 5).map((item, index) => {
                  const href =
                    cardIndex === 0
                      ? buildOverviewDrilldownHref({
                          state,
                          target: "buyers",
                          buyerTaxNumbers:
                            "id" in item && typeof item.id === "string"
                              ? [item.id]
                              : undefined,
                        })
                      : cardIndex === 1
                        ? buildOverviewDrilldownHref({
                            state,
                            target: "products",
                            products: "name" in item ? [item.name] : undefined,
                          })
                        : buildOverviewDrilldownHref({
                            state,
                            target: "regions",
                            buyerRegionCodes:
                              "regionCode" in item &&
                              typeof item.regionCode === "string"
                                ? [item.regionCode]
                                : undefined,
                          });
                  const name =
                    "regionName" in item ? item.regionName : item.name;
                  const secondaryText =
                    cardIndex === 0 &&
                    "id" in item &&
                    typeof item.id === "string" &&
                    item.id.trim()
                      ? `ЄДРПОУ ${item.id}`
                      : cardIndex === 1 && "uktzed" in item && item.uktzed
                        ? `УКТЗЕД ${item.uktzed}`
                        : cardIndex === 2 &&
                            "activeBuyers" in item &&
                            typeof item.activeBuyers === "number"
                          ? `${item.activeBuyers} активних покупців`
                          : null;

                  return (
                    <Link
                      href={href}
                      key={`${card.title}-${index}`}
                      className={`grid ${gridClassName} items-center gap-4 rounded-md border-b border-border/60 px-1 py-2 transition-colors hover:bg-sidebar-accent/45 last:border-b-0`}
                    >
                      <span className="min-w-0">
                        <OverflowTooltipText
                          text={name}
                          className="block whitespace-normal break-words text-sm leading-snug text-foreground"
                        />
                        {secondaryText ? (
                          <OverflowTooltipText
                            text={secondaryText}
                            className="mt-0.5 block whitespace-normal break-words text-[11px] leading-snug text-muted-foreground"
                          />
                        ) : null}
                      </span>
                      <span className="whitespace-nowrap text-sm text-foreground">
                        {formatCompactCurrency(item.amount)}
                      </span>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatPercent(item.share)}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Немає даних рейтингу
                </p>
              )}
              <div
                className={`grid ${gridClassName} items-center gap-4 border-t border-border/70 px-1 pt-2.5 text-sm`}
              >
                <span className="whitespace-nowrap font-semibold text-foreground">
                  {`Разом TOP-${Math.min(rows[cardIndex].length, 5)}`}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCompactCurrency(
                    rows[cardIndex]
                      .slice(0, 5)
                      .reduce((total, item) => total + item.amount, 0),
                  )}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatPercent(
                    rows[cardIndex]
                      .slice(0, 5)
                      .reduce((total, item) => total + item.share, 0),
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SuppliersRankingSheet
        open={activeSheetIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheetIndex(null);
          }
        }}
        card={activeSheetIndex !== null ? topCards[activeSheetIndex] : null}
        state={state}
        accessToken={accessToken}
      />
    </>
  );
}

function TableHeaderButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-left transition-colors hover:text-foreground"
      onClick={onClick}
    >
      <span>{label}</span>
      <ChevronsUpDownIcon
        className={`size-3.5 ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      />
    </button>
  );
}

function SuppliersOperationsTable({
  rows,
  total,
  isLoading,
  isFetching,
  error,
  tableState,
  onRetry,
  onUpdateTableState,
  onExport,
  isExportPending,
  pendingExportFormat,
}: {
  rows: SuppliersTableResponse["items"];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  tableState: OverviewTableState;
  onRetry?: () => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
  pendingExportFormat: OverviewExportFormat | null;
}) {
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(
    {},
  );
  const pageSummaryStart =
    total === 0 ? 0 : (tableState.page - 1) * tableState.limit + 1;
  const pageSummaryEnd = Math.min(tableState.page * tableState.limit, total);
  const totalPages = Math.max(1, Math.ceil(total / tableState.limit));
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => {
      const startPage = Math.max(
        1,
        Math.min(tableState.page - 2, totalPages - 4),
      );
      return startPage + index;
    },
  ).filter((page) => page <= totalPages);

  const columns: Array<{
    key:
      | "period"
      | "buyerRegion"
      | "buyer"
      | "supplier"
      | "product"
      | "uktzed"
      | "quantity"
      | "unit"
      | "priceWithVat"
      | "salesWithVat";
    label: string;
    render: (row: SuppliersTableItem) => React.ReactNode;
  }> = [
    {
      key: "period",
      label: "Період",
      render: (row) => row.period || "—",
    },
    {
      key: "buyerRegion",
      label: "Регіон покупця",
      render: (row) => (
        <OverflowTooltipText
          value={row.buyerRegionName || "Не визначено"}
          className="block whitespace-normal break-words leading-snug"
        />
      ),
    },
    {
      key: "buyer",
      label: "Покупець",
      render: (row) => (
        <OverflowTooltipText
          value={row.buyerName || "—"}
          className="block whitespace-normal break-words leading-snug"
        />
      ),
    },
    {
      key: "supplier",
      label: "Постачальник",
      render: (row) => (
        <OverflowTooltipText
          value={row.supplierName || row.supplierTaxNumber || "—"}
          className="block whitespace-normal break-words leading-snug"
        />
      ),
    },
    {
      key: "product",
      label: "Продукт",
      render: (row) => (
        <OverflowTooltipText
          value={row.product || "—"}
          className="block whitespace-normal break-words leading-snug"
        />
      ),
    },
    {
      key: "uktzed",
      label: "УКТЗЕД",
      render: (row) => row.uktzed || "—",
    },
    {
      key: "quantity",
      label: "Кількість",
      render: (row) => (
        <TooltipValue
          value={formatQuantity(row.quantity)}
          tooltip={formatQuantityWithUnit(row.quantity, row.unit)}
        />
      ),
    },
    {
      key: "unit",
      label: "Од.",
      render: (row) => row.unit || "—",
    },
    {
      key: "priceWithVat",
      label: "Ціна з ПДВ",
      render: (row) => (
        <TooltipValue
          value={formatCompactCurrency(row.priceWithVat)}
          tooltip={formatFullCurrency(row.priceWithVat)}
        />
      ),
    },
    {
      key: "salesWithVat",
      label: "Продажі з ПДВ",
      render: (row) => (
        <TooltipValue
          value={formatCompactCurrency(row.salesWithVat)}
          tooltip={formatFullCurrency(row.salesWithVat)}
        />
      ),
    },
  ];
  const visibleColumns = columns.filter((column) => !hiddenColumns[column.key]);

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <Card className="min-w-0 max-w-full overflow-hidden border border-border/70 shadow-none">
        <CardHeader className="border-b border-border/70 pb-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                <DatabaseIcon className="size-4" />
              </span>
              <CardTitle>Огляд операцій</CardTitle>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" className="h-8 rounded-lg px-3">
                      <EyeOffIcon />
                      Колонки
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-52">
                  {columns.map((column) => {
                    const isVisible = !hiddenColumns[column.key];
                    const visibleCount = columns.filter(
                      (item) => !hiddenColumns[item.key],
                    ).length;

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={isVisible}
                        disabled={isVisible && visibleCount === 1}
                        onCheckedChange={(checked) =>
                          setHiddenColumns((current) => {
                            const next = { ...current };

                            if (checked) {
                              delete next[column.key];
                              return next;
                            }

                            next[column.key] = true;
                            return next;
                          })
                        }
                      >
                        {suppliersTableColumnLabels[column.key] ?? column.label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={isExportPending || total === 0}
                  render={
                    <Button
                      className="h-8 rounded-lg px-3"
                      disabled={isExportPending || total === 0}
                    >
                      {isExportPending ? (
                        <span
                          className="inline-flex animate-spin"
                          style={{
                            animationDuration: "0.9s",
                            animationTimingFunction: "linear",
                            willChange: "transform",
                          }}
                        >
                          <LoaderCircleIcon className="size-4" />
                        </span>
                      ) : (
                        <DownloadIcon />
                      )}
                      {isExportPending
                        ? `Експорт ${pendingExportFormat?.toUpperCase() ?? ""}`.trim()
                        : "Експорт"}
                      <ChevronDownIcon className="size-4 text-current/75" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem
                    disabled={isExportPending || total === 0}
                    onClick={() => onExport("xlsx")}
                  >
                    <FileSpreadsheetIcon />
                    XLSX
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isExportPending || total === 0}
                    onClick={() => onExport("csv")}
                  >
                    <FileTextIcon />
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 space-y-3.5 overflow-hidden pt-3.5">
          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden rounded-md border border-border/70 bg-background">
            <Table className="min-w-[1180px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} className="h-11 px-4">
                      <TableHeaderButton
                        label={column.label}
                        isActive={tableState.sortBy === column.key}
                        onClick={() =>
                          onUpdateTableState({
                            sortBy: column.key,
                            sortDirection:
                              tableState.sortBy === column.key &&
                              tableState.sortDirection === "desc"
                                ? "asc"
                                : "desc",
                            page: 1,
                          })
                        }
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: tableState.limit }).map(
                    (_, rowIndex) => (
                      <TableRow key={rowIndex} className="border-border/70">
                        {visibleColumns.map((column) => (
                          <TableCell
                            key={`${column.key}-${rowIndex}`}
                            className="px-4 py-3"
                          >
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ),
                  )
                ) : error ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="px-4 py-10 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-destructive">{error}</p>
                        {onRetry ? (
                          <Button variant="outline" size="sm" onClick={onRetry}>
                            Retry
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((row, rowIndex) => (
                    <TableRow
                      key={`${row.period}-${row.buyerTaxNumber ?? "empty"}-${rowIndex}`}
                      className="border-border/70"
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={column.key} className="px-4 py-3">
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      Немає рядків, що відповідають поточним фільтрам.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Показано {pageSummaryStart}-{pageSummaryEnd} з {total} рядків
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={tableState.page <= 1}
                  onClick={() =>
                    onUpdateTableState({
                      page: Math.max(1, tableState.page - 1),
                    })
                  }
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={tableState.page === page ? "outline" : "ghost"}
                    size="icon-sm"
                    className={`text-xs ${
                      tableState.page === page
                        ? "border-sidebar-primary bg-background text-foreground shadow-sm dark:border-input dark:bg-input/40 dark:text-foreground dark:hover:bg-input/40"
                        : ""
                    }`}
                    onClick={() => onUpdateTableState({ page })}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={tableState.page >= totalPages}
                  onClick={() =>
                    onUpdateTableState({
                      page: Math.min(totalPages, tableState.page + 1),
                    })
                  }
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>

              <Select
                value={String(tableState.limit)}
                onValueChange={(value) =>
                  onUpdateTableState({
                    limit: Number(value),
                    page: 1,
                  })
                }
              >
                <SelectTrigger className="h-8 min-w-28 rounded-lg px-3">
                  <SelectValue>{tableState.limit} / сторінка</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} / сторінка
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isFetching && !isLoading ? (
            <p className="text-xs text-muted-foreground">Updating table...</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function SuppliersDashboardScreen({
  state,
  accessToken,
  dashboard,
  table,
  isDashboardLoading,
  isDashboardFetching,
  dashboardError,
  isTableLoading,
  isTableFetching,
  tableError,
  onUpdateFilters,
  onUpdateTableState,
  onResetFilters,
  onRetryDashboard,
  onRetryTable,
  onExport,
  isExportPending,
  pendingExportFormat,
  onExportPdf,
  isPdfExportPending,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  dashboard?: SuppliersDashboardResponse;
  table?: SuppliersTableResponse;
  isDashboardLoading: boolean;
  isDashboardFetching: boolean;
  dashboardError: string | null;
  isTableLoading: boolean;
  isTableFetching: boolean;
  tableError: string | null;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onResetFilters: () => void;
  onRetryDashboard: () => void;
  onRetryTable: () => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
  pendingExportFormat: OverviewExportFormat | null;
  onExportPdf: () => void;
  isPdfExportPending: boolean;
}) {
  const hasSuppliersData = Boolean(
    dashboard &&
    (dashboard.kpi.salesWithVat.current > 0 ||
      dashboard.kpi.activeBuyers.current > 0 ||
      dashboard.kpi.salesRegions.current > 0 ||
      dashboard.kpi.productPositions.current > 0 ||
      dashboard.trend.some((item) => item.salesWithVat > 0) ||
      dashboard.topBuyers.length > 0 ||
      dashboard.topProducts.length > 0 ||
      dashboard.topRegions.length > 0),
  );

  return (
    <section className="flex min-w-0 w-full flex-1 flex-col gap-4">
      <SuppliersFilters
        state={state}
        accessToken={accessToken}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
        onExportPdf={onExportPdf}
        isPdfExportPending={isPdfExportPending}
        isPdfExportDisabled={!hasSuppliersData}
      />

      <SuppliersKpiGrid
        kpi={dashboard?.kpi}
        isLoading={isDashboardLoading}
        error={dashboardError}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        onRetry={onRetryDashboard}
      />

      <SuppliersTrendCard
        trend={dashboard?.trend ?? []}
        isLoading={isDashboardLoading}
        isFetching={isDashboardFetching}
        error={dashboardError}
        timeGrain={state.timeGrain}
        comparisonEnabled={state.comparisonMode !== "NONE"}
        onRetry={onRetryDashboard}
        onTimeGrainChange={(timeGrain) => onUpdateFilters({ timeGrain })}
      />

      <SuppliersMarketStructureCard
        data={dashboard?.marketStructure}
        insights={dashboard?.insights ?? []}
        isLoading={isDashboardLoading}
        error={dashboardError}
        onRetry={onRetryDashboard}
      />

      <OverviewMarketInsightsCard
        insights={dashboard?.insights ?? []}
        isLoading={isDashboardLoading}
        error={dashboardError}
        onRetry={onRetryDashboard}
        renderEmptyAsGrid
        emptyGridCount={3}
        emptyGridTemplates={[
          "Продажі змінились на —% порівняно з попереднім періодом",
          "Пік продажів — —",
          "Найбільший регіон попиту — —",
        ]}
        emptyGridTypes={["SALES_CHANGE", "PEAK_SALES_PERIOD", "TOP_REGION"]}
      />

      <SuppliersTopCardsGrid
        state={state}
        accessToken={accessToken}
        topBuyers={dashboard?.topBuyers ?? []}
        topProducts={dashboard?.topProducts ?? []}
        topRegions={dashboard?.topRegions ?? []}
        isLoading={isDashboardLoading}
        error={dashboardError}
        onRetry={onRetryDashboard}
      />

      <SuppliersOperationsTable
        rows={table?.items ?? []}
        total={table?.total ?? 0}
        isLoading={isTableLoading}
        isFetching={isTableFetching}
        error={tableError}
        tableState={state.table}
        onRetry={onRetryTable}
        onUpdateTableState={onUpdateTableState}
        onExport={onExport}
        isExportPending={isExportPending}
        pendingExportFormat={pendingExportFormat}
      />
    </section>
  );
}
