import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  OverviewSortDirection,
  OverviewTableSortBy,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

const tableColumns = [
  "Період",
  "Регіон покупця",
  "Покупець",
  "Постачальник",
  "Продукт",
  "UKTZED",
  "Кількість",
  "Од.",
  "Продажі з ПДВ",
  "Закупівлі з ПДВ",
  "Частка ринку",
] as const;

const sortByOptions: Array<{
  value: OverviewTableSortBy;
  label: string;
}> = [
  { value: "period", label: "Період" },
  { value: "buyerRegion", label: "Регіон покупця" },
  { value: "buyer", label: "Покупець" },
  { value: "supplier", label: "Постачальник" },
  { value: "product", label: "Продукт" },
  { value: "uktzed", label: "UKTZED" },
  { value: "unit", label: "Одиниця" },
  { value: "quantity", label: "Кількість" },
  { value: "salesWithVat", label: "Продажі з ПДВ" },
  { value: "purchasesWithVat", label: "Закупівлі з ПДВ" },
  { value: "marketShare", label: "Частка ринку" },
];

const sortDirectionLabels: Record<OverviewSortDirection, string> = {
  asc: "Asc",
  desc: "Desc",
};

export function OverviewMarketTable({
  tableState,
  onUpdateTableState,
}: {
  tableState: OverviewTableState;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
}) {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-3.5 lg:flex-row lg:items-start lg:justify-between">
        <CardTitle>Огляд ринку</CardTitle>

        <div className="flex flex-wrap gap-2">
          <Select
            value={tableState.sortBy}
            onValueChange={(value) =>
              onUpdateTableState({
                sortBy: value as OverviewTableSortBy,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 min-w-44 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortByOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={tableState.sortDirection}
            onValueChange={(value) =>
              onUpdateTableState({
                sortDirection: value as OverviewSortDirection,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 min-w-28 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortDirectionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-3.5">
        <div className="overflow-hidden rounded-md border border-border/70 bg-background">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                {tableColumns.map((column) => (
                  <TableHead key={column} className="h-11 px-4">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="border-border/70">
                  {tableColumns.map((column, columnIndex) => (
                    <TableCell
                      key={`${column}-${columnIndex}`}
                      className="px-4 py-3"
                    >
                      <span className="inline-block h-4 rounded bg-muted/70 align-middle text-transparent">
                        {columnIndex === 0
                          ? "01.01.2025 — 31.01.2025"
                          : columnIndex === 1
                            ? "Київська обл."
                            : columnIndex === 5
                              ? "2710"
                              : columnIndex > 7
                                ? "₴818.17M"
                                : "— — — — — —"}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Showing 1-5 of 5 rows</p>
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
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="border-sidebar-primary text-foreground"
                aria-current="page"
              >
                {tableState.page}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onUpdateTableState({
                    page: tableState.page + 1,
                  })
                }
                aria-label="Next page"
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
                <SelectValue>{tableState.limit} / page</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
