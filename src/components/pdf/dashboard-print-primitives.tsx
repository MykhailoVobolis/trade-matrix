import type { ReactNode, RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboardIcon } from "lucide-react";

import {
  DashboardKpiGrid,
  type DashboardKpiCardDefinition,
} from "@/components/overview/dashboard-kpi-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCompactCurrency,
  formatPercent,
} from "@/lib/overview/overview-format";
import type { OverviewMetric } from "@/lib/overview/overview-api";

type PrintAccent = "blue" | "cyan" | "amber" | "violet";

const accentStyles: Record<
  PrintAccent,
  { bg: string; text: string; softBg: string; softText: string }
> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    softBg: "#dbeafe",
    softText: "#2563eb",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600",
    softBg: "#cffafe",
    softText: "#0891b2",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    softBg: "#fef3c7",
    softText: "#d97706",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    softBg: "#ede9fe",
    softText: "#7c3aed",
  },
};

export type PrintSummaryItem = {
  label: string;
  value: string[];
};

export type PrintMetricCardConfig = {
  title: string;
  icon: LucideIcon;
  accent: PrintAccent;
  kind: "currency" | "number";
};

export type PrintStructureItem = {
  title: string;
  icon: LucideIcon;
  accent: PrintAccent;
  primary?: string | null;
  secondary?: string | null;
  tertiary?: string | null;
};

export type PrintInsightItem = {
  icon: LucideIcon;
  accent: PrintAccent;
  text: string;
  muted?: boolean;
};

export type PrintTopCardConfig = {
  title: string;
  icon: LucideIcon;
  accent: PrintAccent;
  columns: [string, string, string];
  rows: Array<{
    name: string;
    secondaryText?: string | null;
    amount: number | null | undefined;
    share: number | null | undefined;
  }>;
};

function renderSummaryGrid(items: PrintSummaryItem[], columns: 2 | 3) {
  const normalizedItems =
    columns === 3 && items.length === 2 ? [items[0], items[1], null] : items;

  return (
    <div
      className={`-ml-3 grid gap-4 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}
    >
      {normalizedItems.map((item, index) =>
        item ? (
          <div
            key={`${item.label}-${item.value.join("|")}`}
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
  );
}

export function DashboardPrintSummary({
  reportRef,
  title,
  subtitle,
  primaryItems,
  secondaryItems,
  error,
  children,
}: {
  reportRef?: RefObject<HTMLElement | null>;
  title: string;
  subtitle: string;
  primaryItems: PrintSummaryItem[];
  secondaryItems: PrintSummaryItem[];
  error: string | null;
  children?: ReactNode;
}) {
  return (
    <section
      ref={reportRef}
      className="print-report mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-2 bg-background px-4 py-5 md:px-6"
    >
      <Card className="print-section border border-border/70 shadow-none">
        <CardContent className="flex flex-col gap-4 px-0 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutDashboardIcon className="size-5" />
              </div>
              <div className="flex min-h-11 flex-col justify-center">
                <p className="print-text text-lg font-semibold leading-none text-foreground">
                  {title}
                </p>
                <p className="print-text mt-1 text-sm leading-none text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {renderSummaryGrid(primaryItems, 3)}
          {secondaryItems.length ? renderSummaryGrid(secondaryItems, 3) : null}

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
      {children}
    </section>
  );
}

export function DashboardPrintKpiGrid({
  cards,
  metrics,
  isLoading,
  error,
  comparisonEnabled,
  onRetry,
}: {
  cards: readonly PrintMetricCardConfig[];
  metrics: Array<OverviewMetric | undefined>;
  isLoading: boolean;
  error: string | null;
  comparisonEnabled: boolean;
  onRetry?: () => void;
}) {
  const normalizedCards: DashboardKpiCardDefinition[] = cards.map((card) => ({
    title: card.title,
    icon: card.icon,
    iconClassName: `${accentStyles[card.accent].bg} ${accentStyles[card.accent].text}`,
    kind: card.kind,
  }));

  return (
    <div className="print-section">
      <DashboardKpiGrid
        cards={normalizedCards}
        metrics={metrics}
        isLoading={isLoading}
        error={error}
        comparisonEnabled={comparisonEnabled}
        onRetry={onRetry}
        printMode
      />
    </div>
  );
}

export function DashboardPrintStructure({
  title,
  items,
  isLoading,
  error,
  onRetry,
}: {
  title: string;
  items: PrintStructureItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <Card
      className="print-section border border-border/70 shadow-none"
      style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
    >
      <CardHeader className="pb-3.5">
        <CardTitle className="print-text">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 border-t border-border/70 pt-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          const accent = accentStyles[item.accent];

          return (
            <div
              key={item.title}
              className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
              style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="print-text max-w-[calc(100%-3.5rem)] text-xs font-medium text-muted-foreground">
                  {item.title}
                </p>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${accent.bg} ${accent.text}`}
                  style={{
                    backgroundColor: accent.softBg,
                    color: accent.softText,
                  }}
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
                ) : item.primary ? (
                  <div className="max-w-[calc(100%-3.5rem)]">
                    <p className="print-text break-words text-sm text-foreground">
                      {item.primary}
                    </p>
                    {item.tertiary ? (
                      <p className="print-text mt-0.5 text-xs text-muted-foreground">
                        {item.tertiary}
                      </p>
                    ) : null}
                    {item.secondary ? (
                      <p
                        className={`print-text text-xs text-muted-foreground ${item.tertiary ? "mt-2" : "mt-0.5"}`}
                      >
                        {item.secondary}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="print-text text-sm text-foreground">—</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function DashboardPrintInsights({
  title,
  items,
  isLoading,
  error,
  onRetry,
}: {
  title: string;
  items: PrintInsightItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <Card
      className="print-section border border-border/70 shadow-none"
      style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
    >
      <CardHeader className="pb-3.5">
        <CardTitle className="print-text">{title}</CardTitle>
      </CardHeader>
      <CardContent className="border-t border-border/70 pt-3.5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
                style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 size-10 rounded-md" />
                  <Skeleton className="h-4 w-full max-w-[280px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            <p>{error}</p>
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item, index) => {
              const Icon = item.icon;
              const accent = accentStyles[item.accent];

              return (
                <div
                  key={`${item.text}-${index}`}
                  className="rounded-md border border-border/70 bg-muted/10 px-3.5 py-3"
                  style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-md ${accent.bg} ${accent.text}`}
                      style={{
                        backgroundColor: accent.softBg,
                        color: accent.softText,
                      }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <p
                      className={`print-text text-sm leading-6 ${item.muted ? "text-muted-foreground" : "text-foreground"}`}
                      style={item.muted ? { color: "#71717a" } : undefined}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPrintTopCards({
  cards,
  isLoading,
  error,
  onRetry,
}: {
  cards: PrintTopCardConfig[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const gridClassName =
    "grid-cols-[minmax(0,2.9fr)_minmax(148px,0.62fr)_minmax(72px,0.28fr)]";

  return (
    <div className="grid gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const accent = accentStyles[card.accent];

        return (
          <Card
            key={card.title}
            className="print-section border border-border/70 shadow-none"
            style={{ borderColor: "#d4d4d8", backgroundColor: "#ffffff" }}
          >
            <CardHeader className="gap-3 border-b border-border/70 pb-3.5">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${accent.bg} ${accent.text}`}
                  style={{
                    backgroundColor: accent.softBg,
                    color: accent.softText,
                  }}
                >
                  <Icon className="size-4" />
                </span>
                <div className="flex min-h-10 items-center">
                  <CardTitle className="text-[1.05rem] leading-none">
                    {card.title}
                  </CardTitle>
                </div>
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
              ) : card.rows.length ? (
                card.rows.slice(0, 5).map((row, index) => (
                  <div
                    key={`${card.title}-${index}`}
                    className={`grid ${gridClassName} items-center gap-4 border-b border-border/60 px-1 py-2 last:border-b-0`}
                    style={{ borderBottomColor: "#e4e4e7" }}
                  >
                    <span className="min-w-0">
                      <span className="block whitespace-normal break-words text-sm leading-snug text-foreground">
                        {row.name}
                      </span>
                      {row.secondaryText ? (
                        <span className="mt-0.5 block whitespace-normal break-words text-[11px] leading-snug text-muted-foreground">
                          {row.secondaryText}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className="whitespace-nowrap text-sm text-foreground"
                      style={{ color: "#18181b" }}
                    >
                      {formatCompactCurrency(row.amount)}
                    </span>
                    <span
                      className="whitespace-nowrap text-sm text-muted-foreground"
                      style={{ color: "#71717a" }}
                    >
                      {formatPercent(row.share)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Немає даних рейтингу
                </p>
              )}

              {card.rows.length ? (
                <div
                  className={`grid ${gridClassName} items-center gap-4 border-t border-border/70 px-1 pt-2.5 text-sm`}
                  style={{ borderTopColor: "#d4d4d8" }}
                >
                  <span className="print-text whitespace-nowrap font-semibold text-foreground">
                    Разом TOP-5
                  </span>
                  <span className="print-text whitespace-nowrap text-sm font-semibold text-foreground">
                    {formatCompactCurrency(
                      card.rows
                        .slice(0, 5)
                        .reduce((total, item) => total + (item.amount ?? 0), 0),
                    )}
                  </span>
                  <span className="print-text whitespace-nowrap text-sm font-medium text-foreground">
                    {formatPercent(
                      card.rows
                        .slice(0, 5)
                        .reduce((total, item) => total + (item.share ?? 0), 0),
                    )}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
