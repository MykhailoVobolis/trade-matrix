"use client";

import { useDeferredValue, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudUploadIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  ListFilterIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  deleteRegistryImportRequest,
  getRegistryImportsRequest,
  getRegistryImportStatsRequest,
  MAX_TABLE_UPLOAD_FILES,
  MAX_TABLE_UPLOAD_FILE_SIZE_BYTES,
  prepareTablesUploadPayload,
  type RegistryImportItem,
  type RegistryImportStats,
  type RegistryImportStatus,
  uploadRegistryImportsRequest,
} from "@/lib/tables/tables-api";
import { cn } from "@/lib/utils";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

const statusOptions: Array<{
  value: RegistryImportStatus;
  label: string;
  icon: typeof CheckCircle2Icon;
  chipClassName: string;
}> = [
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2Icon,
    chipClassName:
      "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    value: "processing",
    label: "Processing",
    icon: LoaderCircleIcon,
    chipClassName:
      "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    value: "queued",
    label: "Queued",
    icon: LoaderCircleIcon,
    chipClassName:
      "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    value: "failed",
    label: "Failed",
    icon: AlertCircleIcon,
    chipClassName:
      "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-300",
  },
];

const IMPORT_POLLING_INTERVAL_MS = 2_000;
const IMPORT_POLLING_WINDOW_MS = 30_000;

function getStatusMeta(status: RegistryImportStatus) {
  return (
    statusOptions.find((option) => option.value === status) ?? statusOptions[0]
  );
}

function formatFileSize(bytes: number) {
  const sizeInMb = bytes / (1024 * 1024);

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatImportFileSize(record: RegistryImportItem) {
  if (
    typeof record.fileSizeBytes === "number" &&
    Number.isFinite(record.fileSizeBytes)
  ) {
    return formatFileSize(record.fileSizeBytes);
  }

  if (
    typeof record.fileSizeMb === "number" &&
    Number.isFinite(record.fileSizeMb)
  ) {
    return `${record.fileSizeMb} MB`;
  }

  return "Unknown";
}

function formatImportDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
}

function StatusChip({
  status,
  count,
  active = false,
  onClick,
}: {
  status: RegistryImportStatus;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const { label, chipClassName } = getStatusMeta(status);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        chipClassName,
        active && "ring-2 ring-sidebar-primary/20",
        onClick && "cursor-pointer hover:opacity-90",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px]",
          "bg-background/75 text-current dark:bg-background/20",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function TableStatusBadge({ status }: { status: RegistryImportStatus }) {
  const { label, icon: Icon, chipClassName } = getStatusMeta(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        chipClassName,
      )}
    >
      <Icon
        className={cn(
          "size-3.5",
          status === "processing" ? "animate-spin" : undefined,
        )}
      />
      {label}
    </span>
  );
}

export function TablesScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingDeletion, setPendingDeletion] =
    useState<RegistryImportItem | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | RegistryImportStatus
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [pollingDeadlineAt, setPollingDeadlineAt] = useState<number | null>(
    null,
  );

  const normalizedSearch = deferredQuery.trim();
  const selectedStatusLabel =
    selectedStatus === "all"
      ? "All statuses"
      : getStatusMeta(selectedStatus).label;

  function shouldPollImports(stats?: RegistryImportStats) {
    if (pollingDeadlineAt === null) {
      return false;
    }

    if (Date.now() >= pollingDeadlineAt) {
      return false;
    }

    if (!stats) {
      return true;
    }

    return stats.queuedCount > 0 || stats.processingCount > 0;
  }

  const importsQuery = useQuery({
    queryKey: [
      "registry-imports",
      accessToken,
      currentPage,
      pageSize,
      normalizedSearch,
      selectedStatus,
    ],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getRegistryImportsRequest({
        accessToken,
        page: currentPage,
        perPage: pageSize,
        search: normalizedSearch || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
    },
    enabled: Boolean(accessToken),
    refetchInterval: () => {
      const stats = queryClient.getQueryData<RegistryImportStats>([
        "registry-import-stats",
        accessToken,
      ]);

      return shouldPollImports(stats) ? IMPORT_POLLING_INTERVAL_MS : false;
    },
  });

  const statsQuery = useQuery({
    queryKey: ["registry-import-stats", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getRegistryImportStatsRequest({
        accessToken,
      });
    },
    enabled: Boolean(accessToken),
    refetchInterval: (query) =>
      shouldPollImports(query.state.data) ? IMPORT_POLLING_INTERVAL_MS : false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      const preparedUpload = prepareTablesUploadPayload(files);

      return uploadRegistryImportsRequest({
        formData: preparedUpload.formData,
        accessToken,
      });
    },
    onSuccess: async () => {
      setSelectedStatus("all");
      setQuery("");
      setCurrentPage(1);
      setPollingDeadlineAt(Date.now() + IMPORT_POLLING_WINDOW_MS);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["registry-imports"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["registry-import-stats"],
        }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return deleteRegistryImportRequest({
        id,
        accessToken,
      });
    },
    onSuccess: async () => {
      if ((importsQuery.data?.items.length ?? 0) === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }

      setPendingDeletion(null);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["registry-imports"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["registry-import-stats"],
        }),
      ]);
    },
  });

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  function handleDeleteRecord() {
    if (!pendingDeletion) {
      return;
    }

    deleteMutation.mutate(pendingDeletion.id);
  }

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (files.length > MAX_TABLE_UPLOAD_FILES) {
      setFeedback({
        variant: "error",
        title: "Upload failed",
        message: `You can upload up to ${MAX_TABLE_UPLOAD_FILES} XLSX files at a time.`,
      });
      event.target.value = "";
      return;
    }

    const invalidTypeFile = files.find(
      (file) => !file.name.toLowerCase().endsWith(".xlsx"),
    );

    if (invalidTypeFile) {
      setFeedback({
        variant: "error",
        title: "Upload failed",
        message: "Only XLSX files are supported in the MVP flow.",
      });
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_TABLE_UPLOAD_FILE_SIZE_BYTES,
    );

    if (oversizedFile) {
      setFeedback({
        variant: "error",
        title: "Upload failed",
        message: "Each XLSX file must be 10 MB or smaller.",
      });
      event.target.value = "";
      return;
    }

    uploadMutation.reset();
    deleteMutation.reset();
    setFeedback(null);
    void uploadMutation.mutateAsync(files);
    event.target.value = "";
  }

  const imports = importsQuery.data?.items ?? [];
  const totalItems = importsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageNumbers = buildVisiblePageNumbers(safeCurrentPage, totalPages);
  const pageSummaryStart =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const pageSummaryEnd = Math.min(safeCurrentPage * pageSize, totalItems);
  const stats = statsQuery.data;
  const statusCounts = {
    completed: stats?.completedCount ?? 0,
    processing: stats?.processingCount ?? 0,
    queued: stats?.queuedCount ?? 0,
    failed: stats?.failedCount ?? 0,
  };
  const isStatsLoading = statsQuery.isLoading || statsQuery.isFetching;
  const isInitialTableLoading = importsQuery.isLoading;

  return (
    <section className="flex w-full flex-1 flex-col gap-6">
      <Card className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card">
        <CardHeader className="flex flex-col gap-6 border-b border-border/70 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary/10 text-sidebar-primary">
              <DatabaseIcon className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Database tables
                </CardTitle>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {isStatsLoading
                    ? "Loading..."
                    : `${stats?.totalFiles ?? 0} files`}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {isStatsLoading
                    ? "Loading..."
                    : `${stats?.totalSizeMb?.toFixed(1) ?? "0.0"} MB`}
                </span>
              </div>
              <CardDescription className="max-w-3xl text-sm">
                Upload XLSX table files here before they enter the processing
                pipeline. Search by file name, filter by status, and monitor
                ingestion progress in one place.
              </CardDescription>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="hidden"
            onChange={handleFileSelection}
          />

          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={handleUploadButtonClick}
            disabled={uploadMutation.isPending || !accessToken}
          >
            {uploadMutation.isPending ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CloudUploadIcon />
            )}
            {uploadMutation.isPending ? "Uploading..." : "Upload Tables"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {feedback ? (
            <AuthInlineMessage
              variant={feedback.variant}
              title={feedback.title}
            >
              {feedback.message}
            </AuthInlineMessage>
          ) : null}

          {importsQuery.error ? (
            <AuthInlineMessage variant="error" title="Files load failed">
              {importsQuery.error.message}
            </AuthInlineMessage>
          ) : null}

          {statsQuery.error ? (
            <AuthInlineMessage variant="error" title="Summary load failed">
              {statsQuery.error.message}
            </AuthInlineMessage>
          ) : null}

          {deleteMutation.error ? (
            <AuthInlineMessage variant="error" title="Delete failed">
              {deleteMutation.error.message}
            </AuthInlineMessage>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search files..."
                  className="h-10 rounded-lg pl-9"
                  disabled={!accessToken}
                />
              </div>

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as "all" | RegistryImportStatus);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="!h-[2.5625rem] min-w-40 rounded-lg px-3"
                  aria-label="Filter by status"
                >
                  <span className="flex items-center gap-2">
                    <ListFilterIcon className="size-4 text-muted-foreground" />
                    <SelectValue>{selectedStatusLabel}</SelectValue>
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1">
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <StatusChip
                key={status.value}
                status={status.value}
                count={statusCounts[status.value]}
                active={selectedStatus === status.value}
                onClick={() =>
                  setSelectedStatus((current) => {
                    const nextStatus =
                      current === status.value ? "all" : status.value;

                    setCurrentPage(1);
                    return nextStatus;
                  })
                }
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-12 px-5">File Name</TableHead>
                  <TableHead className="h-12 px-5">Type</TableHead>
                  <TableHead className="h-12 px-5">Size</TableHead>
                  <TableHead className="h-12 px-5">Status</TableHead>
                  <TableHead className="h-12 px-5">Uploaded</TableHead>
                  <TableHead className="h-12 w-14 px-5 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.length > 0 ? (
                  imports.map((record) => (
                    <TableRow
                      key={record.id}
                      className="border-border/70 bg-background/80"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                            <FileSpreadsheetIcon className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <span className="block font-medium text-foreground">
                              {record.fileName}
                            </span>
                            {record.status === "failed" &&
                            record.errorMessage ? (
                              <span className="block text-xs text-destructive">
                                {record.errorMessage}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          XLSX
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {formatImportFileSize(record)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <TableStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {formatImportDate(record.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Open actions for ${record.fileName}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setPendingDeletion(record)}
                            >
                              <Trash2Icon />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isInitialTableLoading ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      Loading uploaded files...
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      No tables match the current search or status filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageSummaryStart}-{pageSummaryEnd} of {totalItems}{" "}
                files
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    aria-label="Previous page"
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
                        className={cn(
                          "text-xs",
                          pageNumber === safeCurrentPage &&
                            "border-sidebar-primary text-foreground",
                        )}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={
                      safeCurrentPage === totalPages || totalItems === 0
                    }
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    aria-label="Next page"
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>

                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className="h-8 min-w-28 rounded-lg px-3"
                    aria-label="Rows per page"
                  >
                    <SelectValue>{pageSize} / page</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-1">
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingDeletion)}
        onOpenChange={(open) => {
          if (!open) {
            deleteMutation.reset();
            setPendingDeletion(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-[1.75rem] p-8"
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Delete document
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {pendingDeletion
                ? `This will remove ${pendingDeletion.fileName} from the tables list.`
                : "This will remove the selected document from the tables list."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 border-t-0 bg-transparent p-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="px-5"
              onClick={() => {
                deleteMutation.reset();
                setPendingDeletion(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-5"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteRecord}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
