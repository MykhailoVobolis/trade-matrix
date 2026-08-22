import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export function OverviewMarketTable() {
  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border/70 pb-3.5 lg:flex-row lg:items-start lg:justify-between">
        <CardTitle>Огляд ринку</CardTitle>

        <div className="flex flex-wrap gap-2">
          <div className="flex h-9 items-center rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex h-9 items-center rounded-md border border-border/70 bg-background px-3 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-20" />
          </div>
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
                      <Skeleton
                        className={`h-4 ${
                          columnIndex < 2
                            ? "w-24"
                            : columnIndex > 7
                              ? "w-16"
                              : "w-20"
                        }`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-44 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
