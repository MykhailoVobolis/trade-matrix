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
  TABLE_UPLOAD_ACCEPT_ATTRIBUTE,
  prepareTablesUploadPayload,
  validateTablesUploadFiles,
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
    label: "Завершено",
    icon: CheckCircle2Icon,
    chipClassName:
      "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    value: "processing",
    label: "Обробляється",
    icon: LoaderCircleIcon,
    chipClassName:
      "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/80 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    value: "queued",
    label: "У черзі",
    icon: LoaderCircleIcon,
    chipClassName:
      "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    value: "failed",
    label: "Помилка",
    icon: AlertCircleIcon,
    chipClassName:
      "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-300",
  },
];

const IMPORT_POLLING_INTERVAL_MS = 2_000;

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

  async function invalidateDatabaseDependentQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["registry-imports"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["registry-import-stats"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["overview"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["buyers"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["products"],
      }),
    ]);
  }

  const normalizedSearch = deferredQuery.trim();
  const selectedStatusLabel =
    selectedStatus === "all"
      ? "Усі статуси"
      : getStatusMeta(selectedStatus).label;

  function shouldPollImports(stats?: RegistryImportStats) {
    if (!stats) {
      return false;
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

      const validationError = validateTablesUploadFiles(files);

      if (validationError) {
        const validationMessages = {
          "too-many-files": "Можно загрузить не более 10 файлов.",
          "file-too-large": "Файл превышает максимальный размер 10 MB.",
          "total-size-too-large":
            "Общий размер файлов не должен превышать 50 MB.",
          "unsupported-extension": "Разрешены только файлы .xlsx и .csv.",
        } satisfies Record<typeof validationError, string>;

        throw new Error(validationMessages[validationError]);
      }

      const preparedUpload = prepareTablesUploadPayload(files);

      return uploadRegistryImportsRequest({
        formData: preparedUpload.formData,
        accessToken,
      });
    },
    onSuccess: async (response) => {
      setSelectedStatus("all");
      setQuery("");
      setCurrentPage(1);

      const failedItems = response.items.filter(
        (item) => item.status === "failed" && item.errorMessage,
      );

      if (failedItems.length > 0) {
        setFeedback({
          variant: "error",
          title: "Некоторые файлы не загружены",
          message: failedItems
            .map((item) => `${item.fileName}: ${item.errorMessage}`)
            .join(" "),
        });
      }

      await invalidateDatabaseDependentQueries();
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

      await invalidateDatabaseDependentQueries();
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

    const validationError = validateTablesUploadFiles(files);

    if (validationError) {
      const validationMessages = {
        "too-many-files": "Можно загрузить не более 10 файлов.",
        "file-too-large": "Файл превышает максимальный размер 10 MB.",
        "total-size-too-large":
          "Общий размер файлов не должен превышать 50 MB.",
        "unsupported-extension": "Разрешены только файлы .xlsx и .csv.",
      } satisfies Record<typeof validationError, string>;

      setFeedback({
        variant: "error",
        title: "Ошибка загрузки",
        message: validationMessages[validationError],
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
    <section className="flex w-full flex-1 flex-col gap-5">
      <Card className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <CardHeader className="flex flex-col gap-5 border-b border-border/70 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
              <DatabaseIcon className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Таблиці бази даних
                </CardTitle>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {isStatsLoading
                    ? "Завантажуємо..."
                    : `${stats?.totalFiles ?? 0} файлів`}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {isStatsLoading
                    ? "Завантажуємо..."
                    : `${stats?.totalSizeMb?.toFixed(1) ?? "0.0"} MB`}
                </span>
              </div>
              <CardDescription className="max-w-3xl text-sm">
                Завантажуйте XLSX або CSV-файли таблиць сюди перед тим, як вони
                потраплять у пайплайн обробки. Шукайте за назвою файлу,
                фільтруйте за статусом і відстежуйте прогрес імпорту в одному
                місці.
              </CardDescription>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={TABLE_UPLOAD_ACCEPT_ATTRIBUTE}
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
            {uploadMutation.isPending
              ? "Завантажуємо..."
              : "Завантажити таблиці"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {feedback ? (
            <AuthInlineMessage
              variant={feedback.variant}
              title={feedback.title}
            >
              {feedback.message}
            </AuthInlineMessage>
          ) : null}

          {uploadMutation.error ? (
            <AuthInlineMessage variant="error" title="Ошибка загрузки">
              {uploadMutation.error.message}
            </AuthInlineMessage>
          ) : null}

          {importsQuery.error ? (
            <AuthInlineMessage
              variant="error"
              title="Не вдалося завантажити файли"
            >
              {importsQuery.error.message}
            </AuthInlineMessage>
          ) : null}

          {statsQuery.error ? (
            <AuthInlineMessage
              variant="error"
              title="Не вдалося завантажити зведення"
            >
              {statsQuery.error.message}
            </AuthInlineMessage>
          ) : null}

          {deleteMutation.error ? (
            <AuthInlineMessage variant="error" title="Не вдалося видалити файл">
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
                  placeholder="Пошук файлів..."
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
                  aria-label="Фільтр за статусом"
                >
                  <span className="flex items-center gap-2">
                    <ListFilterIcon className="size-4 text-muted-foreground" />
                    <SelectValue>{selectedStatusLabel}</SelectValue>
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1">
                  <SelectItem value="all">Усі статуси</SelectItem>
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

          <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-12 px-5">Назва файлу</TableHead>
                  <TableHead className="h-12 px-5">Тип</TableHead>
                  <TableHead className="h-12 px-5">Розмір</TableHead>
                  <TableHead className="h-12 px-5">Статус</TableHead>
                  <TableHead className="h-12 px-5">Завантажено</TableHead>
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
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-muted-foreground">
                            <FileSpreadsheetIcon className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <span className="block font-medium text-foreground">
                              {record.fileName}
                            </span>
                            {record.status === "failed" &&
                            record.errorMessage ? (
                              <span className="block whitespace-normal break-words text-xs leading-5 text-destructive">
                                {record.errorMessage}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {record.fileType}
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
                                aria-label={`Відкрити дії для ${record.fileName}`}
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
                              Видалити
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
                      Завантажуємо файли...
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      Немає таблиць, що відповідають поточному пошуку або
                      статус-фільтру.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Показано {pageSummaryStart}-{pageSummaryEnd} з {totalItems}{" "}
                файлів
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
                          pageNumber === safeCurrentPage ? "outline" : "ghost"
                        }
                        size="icon-sm"
                        className={cn(
                          "text-xs",
                          pageNumber === safeCurrentPage &&
                            "border-sidebar-primary bg-background text-foreground shadow-sm dark:border-input dark:bg-input/40 dark:text-foreground dark:hover:bg-input/40",
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
                    aria-label="Наступна сторінка"
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
                    aria-label="Рядків на сторінку"
                  >
                    <SelectValue>{pageSize} / сторінка</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-1">
                    <SelectItem value="5">5 / сторінка</SelectItem>
                    <SelectItem value="10">10 / сторінка</SelectItem>
                    <SelectItem value="20">20 / сторінка</SelectItem>
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
          className="max-w-md rounded-xl p-8"
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Видалити документ
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {pendingDeletion
                ? `Це видалить ${pendingDeletion.fileName} зі списку таблиць.`
                : "Це видалить вибраний документ зі списку таблиць."}
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
              Скасувати
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-5"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteRecord}
            >
              {deleteMutation.isPending ? "Видаляємо..." : "Видалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
