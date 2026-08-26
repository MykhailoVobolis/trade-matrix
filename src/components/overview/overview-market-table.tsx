"use client";

import { useMemo, useState } from "react";
import {
  createCoreRowModel,
  flexRender,
  stockFeatures,
  useTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  DatabaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  EyeOffIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  RotateCwIcon,
} from "lucide-react";

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
import { OverflowTooltipText } from "@/components/overview/overflow-tooltip-text";
import type {
  OverviewExportFormat,
  OverviewTableItem,
} from "@/lib/overview/overview-api";
import {
  formatCompactCurrency,
  formatFullCurrency,
  formatOverviewTableCell,
  formatQuantityWithUnit,
} from "@/lib/overview/overview-format";
import type {
  OverviewTableSortBy,
  OverviewTableState,
} from "@/lib/overview/overview-url-state";

const pageSizeOptions = [5, 10, 20, 50, 100] as const;

const columnLabels: Record<string, string> = {
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

function TooltipValue({
  value,
  tooltip,
  className,
  alwaysShowTooltip = false,
}: {
  value: string;
  tooltip?: string;
  className?: string;
  alwaysShowTooltip?: boolean;
}) {
  if (
    !tooltip ||
    tooltip === "—" ||
    (!alwaysShowTooltip && tooltip === value)
  ) {
    return <span className={className}>{value}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={className}>{value}</span>} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function TableHeaderButton({
  label,
  sortBy,
  tableState,
  onUpdateTableState,
}: {
  label: string;
  sortBy: OverviewTableSortBy | null;
  tableState: OverviewTableState;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
}) {
  const isActive = sortBy !== null && tableState.sortBy === sortBy;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-left transition-colors hover:text-foreground"
      onClick={() => {
        if (!sortBy) {
          return;
        }

        onUpdateTableState({
          sortBy,
          sortDirection:
            isActive && tableState.sortDirection === "desc" ? "asc" : "desc",
          page: 1,
        });
      }}
    >
      <span>{label}</span>
      {sortBy ? (
        <ChevronsUpDownIcon
          className={`size-3.5 ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}
        />
      ) : null}
    </button>
  );
}

export function OverviewMarketTable({
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
}: {
  rows: OverviewTableItem[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  tableState: OverviewTableState;
  onRetry?: () => void;
  onUpdateTableState: (patch: Partial<OverviewTableState>) => void;
  onExport: (format: OverviewExportFormat) => void;
  isExportPending: boolean;
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<OverviewTableItem>[]>(
    () => [
      {
        id: "period",
        header: () => (
          <TableHeaderButton
            label="Період"
            sortBy="period"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => formatOverviewTableCell(row.original, "period"),
      },
      {
        id: "buyerRegion",
        header: () => (
          <TableHeaderButton
            label="Регіон покупця"
            sortBy="buyerRegion"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <OverflowTooltipText
            value={formatOverviewTableCell(row.original, "buyerRegion")}
            className="block whitespace-normal break-words leading-snug"
          />
        ),
      },
      {
        id: "buyer",
        header: () => (
          <TableHeaderButton
            label="Покупець"
            sortBy="buyer"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <OverflowTooltipText
            value={formatOverviewTableCell(row.original, "buyer")}
            className="block whitespace-normal break-words leading-snug"
          />
        ),
      },
      {
        id: "supplier",
        header: () => (
          <TableHeaderButton
            label="Постачальник"
            sortBy="supplier"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <OverflowTooltipText
            value={formatOverviewTableCell(row.original, "supplier")}
            className="block whitespace-normal break-words leading-snug"
          />
        ),
      },
      {
        id: "product",
        header: () => (
          <TableHeaderButton
            label="Продукт"
            sortBy="product"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <OverflowTooltipText
            value={formatOverviewTableCell(row.original, "product")}
            className="block whitespace-normal break-words leading-snug"
          />
        ),
      },
      {
        id: "uktzed",
        header: () => (
          <TableHeaderButton
            label="УКТЗЕД"
            sortBy="uktzed"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => formatOverviewTableCell(row.original, "uktzed"),
      },
      {
        id: "quantity",
        header: () => (
          <TableHeaderButton
            label="Кількість"
            sortBy="quantity"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <TooltipValue
            value={formatOverviewTableCell(row.original, "quantity")}
            tooltip={formatQuantityWithUnit(
              row.original.quantity,
              row.original.unit,
            )}
          />
        ),
      },
      {
        id: "unit",
        header: () => (
          <TableHeaderButton
            label="Од."
            sortBy="unit"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => formatOverviewTableCell(row.original, "unit"),
      },
      {
        id: "priceWithVat",
        header: () => (
          <TableHeaderButton
            label="Ціна з ПДВ"
            sortBy={null}
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <TooltipValue
            value={formatCompactCurrency(row.original.priceWithVat)}
            tooltip={formatFullCurrency(row.original.priceWithVat)}
          />
        ),
      },
      {
        id: "salesWithVat",
        header: () => (
          <TableHeaderButton
            label="Продажі з ПДВ"
            sortBy="salesWithVat"
            tableState={tableState}
            onUpdateTableState={onUpdateTableState}
          />
        ),
        cell: ({ row }) => (
          <TooltipValue
            value={formatCompactCurrency(row.original.salesWithVat)}
            tooltip={formatFullCurrency(row.original.salesWithVat)}
          />
        ),
      },
    ],
    [onUpdateTableState, tableState],
  );

  const table = useTable({
    features: stockFeatures,
    data: rows,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: createCoreRowModel(),
  });

  const visibleColumnCount = table.getVisibleLeafColumns().length;
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
                  {table.getAllLeafColumns().map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      disabled={
                        column.getIsVisible() &&
                        table
                          .getAllLeafColumns()
                          .filter((tableColumn) => tableColumn.getIsVisible())
                          .length === 1
                      }
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(Boolean(checked))
                      }
                    >
                      {columnLabels[column.id] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
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
                      <DownloadIcon />
                      {isExportPending ? "Експортуємо..." : "Експорт"}
                      <ChevronDownIcon className="size-4 text-current/75" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem onClick={() => onExport("xlsx")}>
                    <FileSpreadsheetIcon />
                    XLSX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("csv")}>
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
            <Table className="min-w-[1280px]">
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-11 px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: tableState.limit }).map(
                    (_, rowIndex) => (
                      <TableRow key={rowIndex} className="border-border/70">
                        {Array.from({ length: visibleColumnCount }).map(
                          (_, cellIndex) => (
                            <TableCell key={cellIndex} className="px-4 py-3">
                              <span className="inline-block h-4 w-20 rounded bg-muted/70 align-middle text-transparent">
                                loading
                              </span>
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ),
                  )
                ) : error ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="px-4 py-10 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-destructive">{error}</p>
                        {onRetry ? (
                          <Button variant="outline" size="sm" onClick={onRetry}>
                            <RotateCwIcon />
                            Повторити
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-border/70">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={visibleColumnCount}
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
                      variant={
                        pageNumber === tableState.page ? "outline" : "ghost"
                      }
                      size="icon-sm"
                      className={
                        pageNumber === tableState.page
                          ? "border-sidebar-primary bg-background text-foreground shadow-sm dark:border-input dark:bg-input/40 dark:text-foreground dark:hover:bg-input/40"
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
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / сторінка
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isFetching && !isLoading ? (
            <p className="text-xs text-muted-foreground">
              Оновлюємо таблицю...
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
