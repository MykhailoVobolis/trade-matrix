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
import type { OverviewTableItem } from "@/lib/overview/overview-api";
import { formatOverviewTableCell } from "@/lib/overview/overview-format";

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
  rows,
  total,
  isLoading,
  isFetching,
  error,
  tableState,
  onUpdateTableState,
}: {
  rows: OverviewTableItem[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  tableState: OverviewTableState;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
}) {
  const pageSummaryStart =
    total === 0 ? 0 : (tableState.page - 1) * tableState.limit + 1;
  const pageSummaryEnd = Math.min(tableState.page * tableState.limit, total);

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
              {isLoading ? (
                Array.from({ length: tableState.limit }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border/70">
                    {tableColumns.map((column, columnIndex) => (
                      <TableCell
                        key={`${column}-${columnIndex}`}
                        className="px-4 py-3"
                      >
                        <span className="inline-block h-4 rounded bg-muted/70 align-middle text-transparent">
                          loading
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={tableColumns.length}
                    className="px-4 py-10 text-center text-sm text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row, rowIndex) => (
                  <TableRow
                    key={`${row.period}-${rowIndex}`}
                    className="border-border/70"
                  >
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "period")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "buyerRegion")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "buyer")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "supplier")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "product")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "uktzed")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "quantity")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "unit")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "salesWithVat")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "purchasesWithVat")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {formatOverviewTableCell(row, "marketShare")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={tableColumns.length}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No overview rows match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageSummaryStart}-{pageSummaryEnd} of {total} rows
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
                disabled={total === 0 || pageSummaryEnd >= total}
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
        {isFetching && !isLoading ? (
          <p className="text-xs text-muted-foreground">Updating table...</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
