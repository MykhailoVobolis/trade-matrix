"use client";

import Link from "next/link";
import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  type LucideIcon,
  MapPinnedIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { OverflowTooltipText } from "@/components/overview/overflow-tooltip-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  OverviewProductRankingItem,
  OverviewRankingItem,
  OverviewRankingDimension,
  OverviewRegionRankingItem,
} from "@/lib/overview/overview-api";
import { buildOverviewDrilldownHref } from "@/lib/overview/overview-drilldown";
import { useOverviewRankingsQuery } from "@/lib/overview/overview-query";
import type { OverviewFilterState } from "@/lib/overview/overview-url-state";
import {
  formatCompactCurrency,
  formatPercent,
} from "@/lib/overview/overview-format";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type OverviewTopCardDefinition = {
  title: string;
  sheetTitle: string;
  columns: [string, string, string];
  icon: LucideIcon;
  iconClassName: string;
};

const topCards: readonly OverviewTopCardDefinition[] = [
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
    columns: ["Постачальник", "Закупівлі з ПДВ", "Частка"],
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
] as const;

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

  return Array.from(pages).sort((left, right) => left - right);
}

function OverviewRankingSheet({
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
    dimension: OverviewRankingDimension | null;
    page: number;
    limit: number;
  }>({
    dimension: null,
    page: 1,
    limit: 10,
  });

  const dimension = useMemo<OverviewRankingDimension | null>(() => {
    if (!card) {
      return null;
    }

    if (card.title === "Топ покупців") return "buyers";
    if (card.title === "Топ постачальників") return "suppliers";
    if (card.title === "Топ продуктів") return "products";

    return "regions";
  }, [card]);
  const page =
    paginationState.dimension === dimension ? paginationState.page : 1;
  const limit =
    paginationState.dimension === dimension ? paginationState.limit : 10;

  const rankingsQuery = useOverviewRankingsQuery({
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
      | OverviewRankingItem
      | OverviewProductRankingItem
      | OverviewRegionRankingItem,
  ) {
    const rawName = "regionName" in item ? item.regionName : item.name;
    const name = rawName?.trim() || "—";
    const secondaryText =
      (dimension === "buyers" || dimension === "suppliers") &&
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
        : dimension === "suppliers"
          ? buildOverviewDrilldownHref({
              state,
              target: "suppliers",
              supplierTaxNumbers:
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

export function OverviewTopCardsGrid({
  state,
  accessToken,
  topBuyers,
  topSuppliers,
  topProducts,
  topRegions,
  isLoading,
  error,
  onRetry,
  printMode = false,
  cardsOverride,
  rowsOverride,
  secondaryTextResolver,
}: {
  state: OverviewFilterState;
  accessToken: string | null;
  topBuyers: OverviewRankingItem[];
  topSuppliers: OverviewRankingItem[];
  topProducts: OverviewProductRankingItem[];
  topRegions: OverviewRegionRankingItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  printMode?: boolean;
  cardsOverride?: readonly OverviewTopCardDefinition[];
  rowsOverride?: Array<
    (
      | OverviewRankingItem
      | OverviewProductRankingItem
      | OverviewRegionRankingItem
    )[]
  >;
  secondaryTextResolver?: (
    item:
      | OverviewRankingItem
      | OverviewProductRankingItem
      | OverviewRegionRankingItem,
    cardIndex: number,
  ) => string | null;
}) {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number | null>(null);
  const cards = cardsOverride ?? topCards;
  const rows = rowsOverride ?? [
    topBuyers,
    topSuppliers,
    topProducts,
    topRegions,
  ];
  const gridClassName =
    "grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)]";

  function getPrintIconStyle(iconClassName: string) {
    if (iconClassName.includes("cyan")) {
      return {
        backgroundColor: "#cffafe",
        color: "#0891b2",
      };
    }

    if (iconClassName.includes("violet")) {
      return {
        backgroundColor: "#ede9fe",
        color: "#7c3aed",
      };
    }

    if (iconClassName.includes("amber")) {
      return {
        backgroundColor: "#fef3c7",
        color: "#d97706",
      };
    }

    return {
      backgroundColor: "#dbeafe",
      color: "#2563eb",
    };
  }

  return (
    <>
      <div className={cn("overview-top-cards-grid grid gap-4", "grid-cols-1")}>
        {cards.map((card, cardIndex) => (
          <Card
            key={card.title}
            className={cn(
              "border border-border/70 shadow-none",
              printMode && "print-section",
            )}
            style={
              printMode
                ? {
                    borderColor: "#d4d4d8",
                    backgroundColor: "#ffffff",
                  }
                : undefined
            }
          >
            <CardHeader className="gap-3 border-b border-border/70 pb-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                    style={
                      printMode
                        ? getPrintIconStyle(card.iconClassName)
                        : undefined
                    }
                  >
                    <card.icon className="size-4" />
                  </span>
                  <div className="flex min-h-10 items-center">
                    <CardTitle className="text-[1.05rem] leading-none">
                      {card.title}
                    </CardTitle>
                  </div>
                </div>
                {printMode ? null : (
                  <button
                    type="button"
                    onClick={() => setActiveSheetIndex(cardIndex)}
                    className="text-xs font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
                  >
                    Переглянути всі
                  </button>
                )}
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
                            target: "suppliers",
                            supplierTaxNumbers:
                              "id" in item && typeof item.id === "string"
                                ? [item.id]
                                : undefined,
                          })
                        : cardIndex === 2
                          ? buildOverviewDrilldownHref({
                              state,
                              target: "products",
                              products:
                                "name" in item ? [item.name] : undefined,
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
                    (secondaryTextResolver?.(item, cardIndex) ??
                    ((cardIndex === 0 || cardIndex === 1) &&
                      "id" in item &&
                      typeof item.id === "string" &&
                      item.id.trim()))
                      ? `ЄДРПОУ ${item.id}`
                      : cardIndex === 2 && "uktzed" in item && item.uktzed
                        ? `УКТЗЕД ${item.uktzed}`
                        : cardIndex === 3 &&
                            "activeBuyers" in item &&
                            typeof item.activeBuyers === "number"
                          ? `${item.activeBuyers} активних покупців`
                          : null;

                  const rowContent = (
                    <>
                      <span className="min-w-0">
                        <OverflowTooltipText
                          text={name}
                          className="print-text block whitespace-normal break-words text-sm leading-snug text-foreground"
                        />
                        {secondaryText ? (
                          <OverflowTooltipText
                            text={secondaryText}
                            className="print-text mt-0.5 block whitespace-normal break-words text-[11px] leading-snug text-muted-foreground"
                          />
                        ) : null}
                      </span>
                      <span className="print-text whitespace-nowrap text-sm text-foreground">
                        {formatCompactCurrency(item.amount)}
                      </span>
                      <span className="print-text whitespace-nowrap text-sm text-muted-foreground">
                        {formatPercent(item.share)}
                      </span>
                    </>
                  );

                  if (printMode) {
                    return (
                      <div
                        key={`${card.title}-${index}`}
                        className={`grid ${gridClassName} items-center gap-4 rounded-md border-b border-border/60 px-1 py-2 last:border-b-0`}
                        style={
                          printMode
                            ? { borderBottomColor: "#e4e4e7" }
                            : undefined
                        }
                      >
                        {rowContent}
                      </div>
                    );
                  }

                  return (
                    <Link
                      href={href}
                      key={`${card.title}-${index}`}
                      className={`grid ${gridClassName} items-center gap-4 rounded-md border-b border-border/60 px-1 py-2 transition-colors hover:bg-sidebar-accent/45 last:border-b-0`}
                    >
                      {rowContent}
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
                <span className="print-text whitespace-nowrap font-semibold text-foreground">
                  {`Разом TOP-${Math.min(rows[cardIndex].length, 5)}`}
                </span>
                <span className="print-text text-sm font-semibold text-foreground">
                  {formatCompactCurrency(
                    rows[cardIndex]
                      .slice(0, 5)
                      .reduce((total, item) => total + item.amount, 0),
                  )}
                </span>
                <span className="print-text text-sm font-medium text-foreground">
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

      <OverviewRankingSheet
        open={!printMode && activeSheetIndex !== null}
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
