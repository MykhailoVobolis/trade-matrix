"use client";

import { useState } from "react";
import {
  BarChart3Icon,
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DatabaseIcon,
  EyeOffIcon,
  MapPinnedIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import { ProductsFilters } from "@/components/products/products-filters";
import { OverviewMarketInsightsCard } from "@/components/overview/overview-market-insights-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import type {
  OverviewFilterState,
  OverviewFilterValues,
  OverviewTableState,
  OverviewTimeGrain,
} from "@/lib/overview/overview-url-state";

const timeGrainOptions: Array<{
  value: OverviewTimeGrain | "";
  label: string;
}> = [
  { value: "", label: "Авто" },
  { value: "MONTH", label: "Місяць" },
  { value: "QUARTER", label: "Квартал" },
  { value: "YEAR", label: "Рік" },
];

const kpiCards = [
  {
    title: "Продажі з ПДВ",
    icon: BarChart3Icon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні постачальники",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Регіони збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

const structureItems = [
  {
    title: "Топ постачальник",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
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
    title: "Частка TOP-5 постачальників",
    icon: TrophyIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
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
    title: "Топ постачальників",
    sheetTitle: "Усі постачальники",
    columns: ["Постачальник", "Продажі з ПДВ", "Частка"],
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Топ регіонів збуту",
    sheetTitle: "Усі регіони збуту",
    columns: ["Регіон покупця", "Продажі з ПДВ", "Частка"],
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

const productsTableColumnLabels: Record<string, string> = {
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

function ProductsKpiGrid() {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            size="sm"
            className="border border-border/70 shadow-none"
          >
            <CardHeader className="gap-2 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[0.78rem] leading-snug text-muted-foreground">
                    {card.title}
                  </p>
                  <CardTitle>
                    <Skeleton className="h-6 w-20" />
                  </CardTitle>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-40 max-w-full" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProductsTrendCard({
  timeGrain,
  onTimeGrainChange,
}: {
  timeGrain: OverviewTimeGrain | "";
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
}) {
  const timeGrainLabel =
    timeGrainOptions.find((option) => option.value === timeGrain)?.label ??
    "Авто";

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Продажі за період</CardTitle>
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
              <SelectValue>{timeGrainLabel}</SelectValue>
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
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-sidebar-primary" />
            Продажі з ПДВ
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-sidebar-primary/70" />
            Попер. період
          </span>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/15 p-4">
          <Skeleton className="h-[320px] w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function StructureValueSkeleton({ width = "w-28" }: { width?: string }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full max-w-[18rem]" />
      <Skeleton className={`h-5 ${width}`} />
    </div>
  );
}

function ProductsMarketStructureCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Структура продажів</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-border/70 pt-3.5 md:grid-cols-2 xl:grid-cols-3">
        {structureItems.map((item) => {
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
              <div className="mt-2">
                <StructureValueSkeleton width="w-1/2" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ProductsTopCardSheet({
  open,
  onOpenChange,
  title,
  columns,
}: {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  title: string;
  columns: string[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-none p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:sm:w-[calc(100vw-2rem)] data-[side=right]:lg:w-[calc(100vw-18rem)] data-[side=right]:xl:w-[calc(100vw-19rem)]"
      >
        <SheetHeader className="gap-2 border-b border-border/70 px-6 py-5 pr-12 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
          <div className="rounded-md border border-border/70">
            <div className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 border-b border-border/70 px-5 py-4 text-sm font-medium text-muted-foreground">
              {columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            <div className="space-y-2.5 px-5 py-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 rounded-md border border-border/60 px-4 py-3"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="icon-sm" disabled>
              <ChevronLeftIcon className="size-4" />
            </Button>
            {Array.from({ length: 5 }).map((_, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="icon-sm"
                className={
                  index === 0 ? "border-sidebar-primary text-sidebar-primary" : ""
                }
                disabled
              >
                {index + 1}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" disabled>
              <ChevronRightIcon className="size-4" />
            </Button>
            <Select value="100" disabled>
              <SelectTrigger className="h-8 min-w-28 rounded-lg px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="p-1">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize} / сторінка
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProductsTopCardsGrid() {
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4">
        {topCards.map((card) => {
          const Icon = card.icon;
          const rows = Array.from({ length: 5 });

          return (
            <Card
              key={card.title}
              className="overflow-hidden border border-border/70 shadow-none"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/70 pb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <CardTitle className="text-[1.05rem]">{card.title}</CardTitle>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/85"
                  onClick={() => setOpenSheet(card.sheetTitle)}
                >
                  Переглянути всі
                </button>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-3.5">
                <div className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 px-1 text-[11px] font-medium text-muted-foreground">
                  {card.columns.map((column) => (
                    <span key={column}>{column}</span>
                  ))}
                </div>
                <div className="space-y-0">
                  {rows.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 border-b border-border/70 px-1 py-3 last:border-b-0"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-full max-w-[28rem]" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                  <div className="grid grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)] gap-4 px-1 py-3 font-medium">
                    <span>Разом TOP-5</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">—</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {topCards.map((card) => (
        <ProductsTopCardSheet
          key={card.sheetTitle}
          open={openSheet === card.sheetTitle}
          onOpenChange={(nextOpen) =>
            setOpenSheet(nextOpen ? card.sheetTitle : null)
          }
          title={card.sheetTitle}
          columns={card.columns}
        />
      ))}
    </>
  );
}

function ProductsOperationsTable({
  state,
  onUpdateTableState,
}: {
  state: OverviewFilterState;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
}) {
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(
    {},
  );

  const columns = [
    "period",
    "buyerRegion",
    "buyer",
    "supplier",
    "product",
    "uktzed",
    "quantity",
    "unit",
    "priceWithVat",
    "salesWithVat",
  ] as const;
  const visibleColumns = columns.filter((column) => !hiddenColumns[column]);

  const pageCount = 5;

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <Card className="min-w-0 max-w-full overflow-hidden border border-border/70 shadow-none">
        <CardHeader className="border-b border-border/70 pb-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                <DatabaseIcon className="size-4" />
              </span>
              <CardTitle>Огляд продажів</CardTitle>
            </div>

            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg px-3"
                    >
                      <EyeOffIcon className="size-4" />
                      Колонки
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-52">
                  {columns.map((column) => {
                    const isVisible = !hiddenColumns[column];
                    const visibleCount = columns.filter(
                      (item) => !hiddenColumns[item],
                    ).length;

                    return (
                      <DropdownMenuCheckboxItem
                        key={column}
                        checked={isVisible}
                        disabled={isVisible && visibleCount === 1}
                        onCheckedChange={(checked) =>
                          setHiddenColumns((current) => {
                            const next = { ...current };

                            if (checked) {
                              delete next[column];
                              return next;
                            }

                            next[column] = true;
                            return next;
                          })
                        }
                      >
                        {productsTableColumnLabels[column]}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
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
                  {visibleColumns.map((column) => {
                    const isActiveSort = state.table.sortBy === column;

                    return (
                      <TableHead key={column} className="h-11 px-4">
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 text-left transition-colors hover:text-foreground ${
                            isActiveSort ? "text-foreground" : "text-muted-foreground"
                          }`}
                          onClick={() => {
                            const isCurrentColumn = state.table.sortBy === column;
                            const nextDirection =
                              isCurrentColumn &&
                              state.table.sortDirection === "asc"
                                ? "desc"
                                : "asc";

                            onUpdateTableState({
                              sortBy: column,
                              sortDirection: nextDirection,
                            });
                          }}
                        >
                          {productsTableColumnLabels[column]}
                          <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
                        </button>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border/70">
                    {visibleColumns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`} className="px-4 py-3">
                        <Skeleton
                          className={
                            column === "product" ||
                            column === "buyer" ||
                            column === "supplier"
                              ? "h-5 w-40"
                              : "h-5 w-24"
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Показано 1-5 з 0 рядків
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-lg" disabled>
                <ChevronLeftIcon className="size-4" />
              </Button>
              {Array.from({ length: pageCount }).map((_, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className={`h-9 min-w-9 rounded-lg px-0 ${
                    index === 0 ? "border-sidebar-primary text-sidebar-primary" : ""
                  }`}
                  disabled
                >
                  {index + 1}
                </Button>
              ))}
              <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-lg" disabled>
                <ChevronRightIcon className="size-4" />
              </Button>

              <Select
                value={String(state.table.limit)}
                onValueChange={(value) =>
                  onUpdateTableState({
                    page: 1,
                    limit: Number(value),
                  })
                }
              >
                <SelectTrigger className="h-9 min-w-32 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="p-1">
                  {[5, 10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize} / сторінка
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ProductsDashboardScreenProps = {
  state: OverviewFilterState;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onResetFilters: () => void;
};

export function ProductsDashboardScreen({
  state,
  onUpdateFilters,
  onUpdateTableState,
  onResetFilters,
}: ProductsDashboardScreenProps) {
  return (
    <section className="flex min-w-0 w-full flex-1 flex-col gap-4">
      <ProductsFilters
        state={state}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
      />

      <ProductsKpiGrid />

      <ProductsTrendCard
        timeGrain={state.timeGrain}
        onTimeGrainChange={(timeGrain) => onUpdateFilters({ timeGrain })}
      />

      <ProductsMarketStructureCard />

      <OverviewMarketInsightsCard
        insights={[]}
        isLoading={false}
        error={null}
        renderEmptyAsGrid
        emptyGridCount={3}
        emptyGridTemplates={[
          "Продажі змінились на —% порівняно з попереднім періодом",
          "Пік продажів — —",
          "Найбільший регіон попиту — —",
        ]}
        emptyGridTypes={["SALES_CHANGE", "PEAK_SALES_PERIOD", "TOP_REGION"]}
      />

      <ProductsTopCardsGrid />

      <ProductsOperationsTable
        state={state}
        onUpdateTableState={onUpdateTableState}
      />
    </section>
  );
}
