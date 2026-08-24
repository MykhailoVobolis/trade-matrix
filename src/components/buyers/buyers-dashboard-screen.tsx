"use client";

import { useMemo, useState } from "react";
import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  MapPinnedIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";

import { BuyersFilters } from "@/components/buyers/buyers-filters";
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
import type { OverviewExportFormat } from "@/lib/overview/overview-api";
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
    title: "Закупівлі з ПДВ",
    icon: ShoppingCartIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Активні постачальники",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Регіони попиту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Товарні позиції",
    icon: PackageIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
] as const;

const structureItems = [
  {
    title: "Топ постачальник",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Топ регіон постачання",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Топ УКТЗЕД",
    icon: TagIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Частка TOP-5 постачальників",
    icon: TrophyIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Частка TOP-5 регіонів постачання",
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
    title: "Топ регіонів попиту",
    sheetTitle: "Усі регіони попиту",
    columns: ["Регіон попиту", "Закупівлі з ПДВ", "Частка"],
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

const buyersTableColumnLabels: Record<string, string> = {
  period: "Період",
  buyerRegion: "Регіон попиту",
  buyer: "Покупець",
  supplier: "Постачальник",
  product: "Продукт",
  uktzed: "УКТЗЕД",
  quantity: "Кількість",
  unit: "Од.",
  priceWithVat: "Ціна з ПДВ",
  purchasesWithVat: "Закупівлі з ПДВ",
};

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

  return Array.from(pages).sort((left, right) => left - right);
}

function BuyersKpiGrid() {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            size="sm"
            className="flex h-full border border-border/70 shadow-none"
          >
            <CardHeader className="gap-2 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[0.78rem] leading-snug text-muted-foreground">
                    {card.title}
                  </p>
                  <CardTitle>
                    <Skeleton className="h-8 w-24" />
                  </CardTitle>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end space-y-1.5 pt-0">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function BuyersTrendCard({
  timeGrain,
  onTimeGrainChange,
}: {
  timeGrain: OverviewTimeGrain | "";
  onTimeGrainChange: (timeGrain: OverviewTimeGrain | "") => void;
}) {
  const resolvedTimeGrainLabel =
    timeGrainOptions.find((option) => option.value === timeGrain)?.label ??
    "Авто";

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Закупівлі за період</CardTitle>

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
            <span className="h-px w-6 border-t border-dashed border-cyan-500/80" />
            Попер. період
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-600" />
            Закупівлі з ПДВ
          </div>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/15 p-4">
          <Skeleton className="h-[320px] w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function BuyersMarketStructureCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Структура закупівель</CardTitle>
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
              <div className="mt-2 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const buyerInsightItems = [
  {
    text: "Закупівлі змінились на —% порівняно з попереднім періодом",
    icon: TrendingUpIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    text: "Пік закупівель — —",
    icon: TrendingUpIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    text: "Найбільший регіон постачання — —",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

function BuyersMarketInsightsCard() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3.5">
        <CardTitle>Ринкові інсайти</CardTitle>
      </CardHeader>
      <CardContent className="border-t border-border/70 pt-3.5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {buyerInsightItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.text}
                className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.iconClassName}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <p className="text-sm leading-6 text-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BuyersRankingSheet({
  open,
  onOpenChange,
  card,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: (typeof topCards)[number] | null;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const pageNumbers = getPageNumbers(page, 5);

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
          </div>

          <div className="border-t border-border/70 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Показано 0-0 з 0</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="outline" size="icon-sm" disabled>
                  <ChevronLeftIcon />
                </Button>
                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="icon-sm"
                    className={
                      pageNumber === page
                        ? "border-sidebar-primary text-foreground"
                        : ""
                    }
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
                <Button variant="outline" size="icon-sm" disabled>
                  <ChevronRightIcon />
                </Button>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
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

function BuyersTopCardsGrid() {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number | null>(null);
  const gridClassName =
    "grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)]";

  return (
    <>
      <div className="grid gap-4">
        {topCards.map((card) => (
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
                  onClick={() =>
                    setActiveSheetIndex(
                      topCards.findIndex((item) => item.title === card.title),
                    )
                  }
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

              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`grid ${gridClassName} items-center gap-4 border-b border-border/60 px-1 py-2 last:border-b-0`}
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}

              <div
                className={`grid ${gridClassName} items-center gap-4 border-t border-border/70 px-1 pt-2.5 text-sm`}
              >
                <span className="whitespace-nowrap font-semibold text-foreground">
                  Разом TOP-5
                </span>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BuyersRankingSheet
        open={activeSheetIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheetIndex(null);
          }
        }}
        card={activeSheetIndex !== null ? topCards[activeSheetIndex] : null}
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

function BuyersOperationsTable({
  tableState,
  onUpdateTableState,
}: {
  tableState: OverviewTableState;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
}) {
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const visibleColumns = useMemo(
    () =>
      (
        [
          "period",
          "buyerRegion",
          "buyer",
          "supplier",
          "product",
          "uktzed",
          "quantity",
          "unit",
          "priceWithVat",
          "purchasesWithVat",
        ] as const
      ).filter((column) => !hiddenColumns.includes(column)),
    [hiddenColumns],
  );
  const totalPages = 5;
  const pageNumbers = getPageNumbers(tableState.page, totalPages);

  return (
    <Card className="overflow-hidden border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Огляд закупівель</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="gap-2 px-3 shadow-none">
                <EyeOffIcon className="size-4" />
                Колонки
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-48">
            {Object.entries(buyersTableColumnLabels).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={!hiddenColumns.includes(key)}
                onCheckedChange={(checked) => {
                  setHiddenColumns((current) =>
                    checked
                      ? current.filter((column) => column !== key)
                      : [...current, key],
                  );
                }}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="overflow-x-auto">
          <div className="min-w-[1120px] rounded-lg border border-border/70">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {visibleColumns.map((column) => (
                    <TableHead
                      key={column}
                      className="whitespace-nowrap px-4 py-3 font-medium text-foreground"
                    >
                      <TableHeaderButton
                        label={buyersTableColumnLabels[column]}
                        isActive={tableState.sortBy === column}
                        onClick={() =>
                          onUpdateTableState({
                            sortBy: column,
                            sortDirection:
                              tableState.sortBy === column &&
                              tableState.sortDirection === "asc"
                                ? "desc"
                                : "asc",
                            page: 1,
                          })
                        }
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: tableState.limit }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-transparent">
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-4"
                      >
                        <Skeleton
                          className={`h-4 ${
                            column === "product" ||
                            column === "supplier" ||
                            column === "buyer"
                              ? "w-40"
                              : column === "purchasesWithVat"
                                ? "w-20"
                                : "w-16"
                          }`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Показано 0-0 з 0 рядків
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
                    variant="outline"
                    size="icon-sm"
                    className={
                      pageNumber === tableState.page
                        ? "border-sidebar-primary text-foreground"
                        : ""
                    }
                    onClick={() =>
                      onUpdateTableState({
                        page: pageNumber,
                      })
                    }
                  >
                    {pageNumber}
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="icon-sm"
                disabled={tableState.page >= totalPages}
                onClick={() =>
                  onUpdateTableState({
                    page: tableState.page + 1,
                  })
                }
                aria-label="Наступна сторінка"
              >
                <ChevronRightIcon />
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
              <SelectContent className="p-1">
                <SelectItem value="5">5 / сторінка</SelectItem>
                <SelectItem value="10">10 / сторінка</SelectItem>
                <SelectItem value="20">20 / сторінка</SelectItem>
                <SelectItem value="50">50 / сторінка</SelectItem>
                <SelectItem value="100">100 / сторінка</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BuyersDashboardScreen({
  state,
  onUpdateFilters,
  onUpdateTableState,
  onResetFilters,
  onExport,
  isExportPending,
}: {
  state: OverviewFilterState;
  onUpdateFilters: (patch: Partial<OverviewFilterValues>) => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onResetFilters: () => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
}) {
  return (
    <section className="flex min-w-0 w-full flex-1 flex-col gap-4">
      <BuyersFilters
        state={state}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
        onExport={onExport}
        isExportPending={isExportPending}
      />

      <BuyersKpiGrid />

      <BuyersTrendCard
        timeGrain={state.timeGrain}
        onTimeGrainChange={(timeGrain) => onUpdateFilters({ timeGrain })}
      />

      <BuyersMarketStructureCard />

      <BuyersMarketInsightsCard />

      <BuyersTopCardsGrid />

      <BuyersOperationsTable
        tableState={state.table}
        onUpdateTableState={onUpdateTableState}
      />
    </section>
  );
}
