import { requestJson } from "@/lib/api/http-client";

export const MAX_TABLE_UPLOAD_FILES = 20;
export const MAX_TABLE_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export type RegistryImportStatus =
  "queued" | "processing" | "completed" | "failed";

export type RegistryImportUploadItem = {
  id: string;
  fileName: string;
  fileSizeBytes?: number | null;
  fileSizeMb?: number | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type RegistryImportItem = RegistryImportUploadItem & {
  status: RegistryImportStatus;
  rowCount: number | null;
};

export type RegistryImportListResponse = {
  items: RegistryImportItem[];
  total: number;
  page: number;
  perPage: number;
};

export type RegistryImportUploadResponse = {
  items: RegistryImportUploadItem[];
};

export type RegistryImportStats = {
  completedCount: number;
  processingCount: number;
  queuedCount: number;
  failedCount: number;
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeMb: number;
};

export type RegistryImportRecordsQuery = {
  sellerRegionCode?: string;
  sellerDistrictCode?: string;
  sellerIpn?: string;
  sellerName?: string;
  buyerRegionCode?: string;
  buyerDistrictCode?: string;
  buyerIpn?: string;
  buyerName?: string;
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  itemDescription?: string;
  uktzedCode?: string;
  unitName?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type RegistryImportRecord = {
  id: string;
  importId: string;
  rowNumber: number;
  sellerRegionCode: string | null;
  sellerDistrictCode: string | null;
  sellerIpn: string | null;
  sellerName: string | null;
  buyerRegionCode: string | null;
  buyerDistrictCode: string | null;
  buyerIpn: string | null;
  buyerName: string | null;
  invoiceDate: string | null;
  itemDescription: string | null;
  uktzedCode: string | null;
  unitName: string | null;
  unitPriceActual: string | null;
  createdAt: string;
};

export type RegistryImportRecordsResponse = {
  items: RegistryImportRecord[];
  total: number;
  page: number;
  perPage: number;
};

type RegistryImportListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: RegistryImportStatus;
};

type MessageResponse = {
  message: string;
};

export type PreparedTablesUploadPayload = {
  files: File[];
  formData: FormData;
  fileCount: number;
  totalBytes: number;
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const normalizedValue = typeof value === "string" ? value.trim() : value;

    if (normalizedValue === "") {
      return;
    }

    searchParams.set(key, String(normalizedValue));
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function prepareTablesUploadPayload(
  files: File[],
): PreparedTablesUploadPayload {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return {
    files,
    formData,
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.size, 0),
  };
}

export async function uploadRegistryImportsRequest({
  formData,
  accessToken,
}: {
  formData: FormData;
  accessToken: string;
}): Promise<RegistryImportUploadResponse> {
  return requestJson<RegistryImportUploadResponse>({
    path: "/api/registry-imports/upload",
    method: "POST",
    body: formData,
    accessToken,
  });
}

export async function getRegistryImportsRequest({
  page,
  perPage,
  search,
  status,
  accessToken,
}: RegistryImportListQuery & {
  accessToken: string;
}): Promise<RegistryImportListResponse> {
  const queryString = buildQueryString({
    page,
    perPage,
    search,
    status,
  });

  return requestJson<RegistryImportListResponse>({
    path: `/api/registry-imports${queryString}`,
    accessToken,
  });
}

export async function getRegistryImportStatsRequest({
  accessToken,
}: {
  accessToken: string;
}): Promise<RegistryImportStats> {
  return requestJson<RegistryImportStats>({
    path: "/api/registry-imports/stats",
    accessToken,
  });
}

export async function deleteRegistryImportRequest({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}): Promise<MessageResponse> {
  return requestJson<MessageResponse>({
    path: `/api/registry-imports/${id}`,
    method: "DELETE",
    accessToken,
  });
}

export async function getRegistryImportRecordsRequest({
  accessToken,
  ...query
}: RegistryImportRecordsQuery & {
  accessToken: string;
}): Promise<RegistryImportRecordsResponse> {
  const queryString = buildQueryString(query);

  return requestJson<RegistryImportRecordsResponse>({
    path: `/api/registry-imports/records${queryString}`,
    accessToken,
  });
}
