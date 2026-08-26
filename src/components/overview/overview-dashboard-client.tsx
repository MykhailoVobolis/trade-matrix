"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { OverviewDashboardScreen } from "@/components/overview/overview-dashboard-screen";
import { OverviewPrintScreen } from "@/components/overview/overview-print-screen";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  exportOverviewRequest,
  getOverviewFilterOptionsRequest,
  type OverviewExportFormat,
  type OverviewFilterOptionsDimension,
} from "@/lib/overview/overview-api";
import {
  useOverviewQuery,
  useOverviewTableQuery,
} from "@/lib/overview/overview-query";
import {
  getDefaultOverviewFilterState,
  normalizeOverviewFilterState,
  parseOverviewSearchParams,
  persistOverviewFilterState,
  readPersistedOverviewFilterState,
  serializeOverviewSearchParams,
  type OverviewFilterState,
  type OverviewFilterValues,
  type OverviewTableState,
} from "@/lib/overview/overview-url-state";

function createUrl(pathname: string, state: OverviewFilterState) {
  const params = serializeOverviewSearchParams(
    normalizeOverviewFilterState(state),
  );
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

const exportThemeVariables = {
  colorScheme: "light",
  "--background": "#ffffff",
  "--foreground": "#171717",
  "--card": "#ffffff",
  "--card-foreground": "#171717",
  "--popover": "#ffffff",
  "--popover-foreground": "#171717",
  "--primary": "#2563eb",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f5f5f5",
  "--secondary-foreground": "#262626",
  "--muted": "#f5f5f5",
  "--muted-foreground": "#737373",
  "--accent": "#eff6ff",
  "--accent-foreground": "#315ca8",
  "--destructive": "#dc2626",
  "--border": "#e5e5e5",
  "--input": "#e5e5e5",
  "--ring": "#a3a3a3",
  "--sidebar": "#fafafa",
  "--sidebar-foreground": "#171717",
  "--sidebar-primary": "#2563eb",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-accent": "#eff6ff",
  "--sidebar-accent-foreground": "#315ca8",
  "--sidebar-border": "#e5e5e5",
  "--sidebar-ring": "#a3a3a3",
} satisfies CSSProperties;

type FrozenStyleSnapshot = Array<{
  element: HTMLElement;
  styleAttribute: string | null;
}>;

let colorNormalizationContext: CanvasRenderingContext2D | null = null;

function normalizeCssColor(value: string) {
  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    trimmedValue === "transparent" ||
    trimmedValue === "currentcolor" ||
    trimmedValue === "inherit" ||
    trimmedValue === "initial" ||
    trimmedValue === "unset" ||
    trimmedValue === "none"
  ) {
    return trimmedValue;
  }

  if (!colorNormalizationContext) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    colorNormalizationContext = canvas.getContext("2d");
  }

  if (!colorNormalizationContext) {
    return trimmedValue;
  }

  colorNormalizationContext.fillStyle = "#000000";

  try {
    colorNormalizationContext.fillStyle = trimmedValue;
    return colorNormalizationContext.fillStyle;
  } catch {
    return trimmedValue;
  }
}

function freezeExportStyles(root: HTMLElement): FrozenStyleSnapshot {
  const snapshot: FrozenStyleSnapshot = [];
  const elements = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>("*")),
  ];

  for (const element of elements) {
    snapshot.push({
      element,
      styleAttribute: element.getAttribute("style"),
    });

    const computed = window.getComputedStyle(element);

    const colorProperties = [
      "color",
      "background-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
      "text-decoration-color",
      "caret-color",
      "column-rule-color",
      "fill",
      "stroke",
    ] as const;

    for (const property of colorProperties) {
      const value = computed.getPropertyValue(property);

      if (value) {
        element.style.setProperty(
          property,
          normalizeCssColor(value),
          "important",
        );
      }
    }

    const boxShadow = computed.getPropertyValue("box-shadow");

    if (boxShadow) {
      element.style.setProperty("box-shadow", boxShadow, "important");
    }
  }

  return snapshot;
}

function restoreFrozenStyles(snapshot: FrozenStyleSnapshot) {
  for (const item of snapshot) {
    if (item.styleAttribute === null) {
      item.element.removeAttribute("style");
      continue;
    }

    item.element.setAttribute("style", item.styleAttribute);
  }
}

type OverviewPrintFilterLabels = {
  buyerRegions: Record<string, string>;
  buyers: Record<string, string>;
  suppliers: Record<string, string>;
};

async function resolveFilterLabels(
  state: OverviewFilterState,
  accessToken: string,
): Promise<OverviewPrintFilterLabels> {
  const result: OverviewPrintFilterLabels = {
    buyerRegions: {},
    buyers: {},
    suppliers: {},
  };

  const tasks: Array<Promise<void>> = [];

  function queueDimension(
    dimension: OverviewFilterOptionsDimension,
    values: string[],
    target: keyof OverviewPrintFilterLabels,
  ) {
    for (const value of values) {
      tasks.push(
        getOverviewFilterOptionsRequest({
          state,
          dimension,
          search: value,
          page: 1,
          limit: 20,
          accessToken,
        }).then((response) => {
          const exactMatch = response.items.find(
            (item) => item.value === value,
          );

          if (exactMatch?.label) {
            result[target][value] = exactMatch.label;
          }
        }),
      );
    }
  }

  queueDimension("buyerRegions", state.buyerRegionCodes, "buyerRegions");
  queueDimension("buyers", state.buyerTaxNumbers, "buyers");
  queueDimension("suppliers", state.supplierTaxNumbers, "suppliers");

  await Promise.all(tasks);

  return result;
}

export function OverviewDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const parsedState = useMemo(
    () => parseOverviewSearchParams(searchParams),
    [searchParams],
  );
  const searchParamsString = searchParams.toString();
  const persistedState = useMemo(
    () =>
      typeof window !== "undefined" && !searchParamsString
        ? readPersistedOverviewFilterState()
        : null,
    [searchParamsString],
  );
  const state = persistedState ?? parsedState;

  useEffect(() => {
    persistOverviewFilterState(state);
  }, [state]);

  useEffect(() => {
    if (searchParamsString || !persistedState) {
      return;
    }

    startTransition(() => {
      router.replace(createUrl(pathname, persistedState), {
        scroll: false,
      });
    });
  }, [pathname, persistedState, router, searchParamsString]);

  const overviewQuery = useOverviewQuery({
    state,
    accessToken,
  });
  const overviewTableQuery = useOverviewTableQuery({
    state,
    accessToken,
  });
  const exportReportRef = useRef<HTMLElement | null>(null);
  const [isPdfExportPending, setIsPdfExportPending] = useState(false);
  const [pdfExportError, setPdfExportError] = useState<string | null>(null);
  const [printFilterLabels, setPrintFilterLabels] =
    useState<OverviewPrintFilterLabels>({
      buyerRegions: {},
      buyers: {},
      suppliers: {},
    });
  const exportMutation = useMutation({
    mutationFn: async (format: OverviewExportFormat) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return exportOverviewRequest({
        state,
        format,
        accessToken,
      });
    },
    onSuccess: ({ blob, fileName }) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    },
  });

  function replaceState(nextState: OverviewFilterState) {
    persistOverviewFilterState(nextState);

    startTransition(() => {
      router.replace(createUrl(pathname, nextState), { scroll: false });
    });
  }

  function updateOverviewFilters(patch: Partial<OverviewFilterValues>) {
    replaceState({
      ...state,
      ...patch,
      table: {
        ...state.table,
        page: 1,
      },
    });
  }

  function updateTableState(patch: Partial<OverviewTableState>) {
    replaceState({
      ...state,
      table: {
        ...state.table,
        ...patch,
      },
    });
  }

  function resetFilters() {
    replaceState(getDefaultOverviewFilterState());
  }

  async function exportPdf() {
    if (!exportReportRef.current || isPdfExportPending || !accessToken) {
      return;
    }

    setIsPdfExportPending(true);
    setPdfExportError(null);
    let frozenStyles: FrozenStyleSnapshot | null = null;
    try {
      if ("fonts" in document) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, 1500)),
        ]);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 250));

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const exportNode = exportReportRef.current;

      if (!exportNode) {
        throw new Error("PDF export container is unavailable.");
      }

      const resolvedLabels = await resolveFilterLabels(state, accessToken);
      flushSync(() => {
        setPrintFilterLabels(resolvedLabels);
      });

      frozenStyles = freezeExportStyles(exportNode);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      let cursorY = margin;
      let pageIndex = 0;

      const sectionNodes = Array.from(
        exportNode.querySelectorAll<HTMLElement>(".print-section"),
      );
      const nodesToExport = sectionNodes.length ? sectionNodes : [exportNode];

      function addNewPage() {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        pageIndex += 1;
        cursorY = margin;
      }

      function drawCanvasSlice(
        sectionCanvas: HTMLCanvasElement,
        sourceOffsetY: number,
        sliceHeightPx: number,
        targetHeightPt: number,
      ) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = sectionCanvas.width;
        pageCanvas.height = sliceHeightPx;

        const pageContext = pageCanvas.getContext("2d");

        if (!pageContext) {
          throw new Error("PDF export canvas context is unavailable.");
        }

        pageContext.fillStyle = "#ffffff";
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageContext.drawImage(
          sectionCanvas,
          0,
          sourceOffsetY,
          sectionCanvas.width,
          sliceHeightPx,
          0,
          0,
          sectionCanvas.width,
          sliceHeightPx,
        );

        const imageData = pageCanvas.toDataURL("image/png");

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          cursorY,
          contentWidth,
          targetHeightPt,
          undefined,
          "FAST",
        );
      }

      addNewPage();

      for (const sectionNode of nodesToExport) {
        const sectionCanvas = await html2canvas(sectionNode, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: sectionNode.scrollWidth,
          windowHeight: sectionNode.scrollHeight,
          scrollX: 0,
          scrollY: 0,
        });

        const pixelsPerPoint = sectionCanvas.width / contentWidth;
        const sectionHeightPt = sectionCanvas.height / pixelsPerPoint;
        let remainingHeightPt = pageHeight - margin - cursorY;

        if (
          sectionHeightPt <= contentHeight &&
          sectionHeightPt > remainingHeightPt &&
          cursorY > margin
        ) {
          addNewPage();
          remainingHeightPt = pageHeight - margin - cursorY;
        }

        if (sectionHeightPt <= remainingHeightPt) {
          drawCanvasSlice(
            sectionCanvas,
            0,
            sectionCanvas.height,
            sectionHeightPt,
          );
          cursorY += sectionHeightPt + 10;
          continue;
        }

        let sourceOffsetY = 0;
        let availableHeightPt = remainingHeightPt;

        while (sourceOffsetY < sectionCanvas.height) {
          if (availableHeightPt <= 24) {
            addNewPage();
            availableHeightPt = contentHeight;
          }

          const sliceHeightPx = Math.min(
            sectionCanvas.height - sourceOffsetY,
            Math.floor(availableHeightPt * pixelsPerPoint),
          );
          const targetHeightPt = sliceHeightPx / pixelsPerPoint;

          drawCanvasSlice(
            sectionCanvas,
            sourceOffsetY,
            sliceHeightPx,
            targetHeightPt,
          );

          sourceOffsetY += sliceHeightPx;
          cursorY += targetHeightPt + 8;
          availableHeightPt = pageHeight - margin - cursorY;

          if (sourceOffsetY < sectionCanvas.height) {
            addNewPage();
            availableHeightPt = contentHeight;
          }
        }

        cursorY += 2;
      }

      pdf.save(`overview-report-${state.dateFrom}-${state.dateTo}.pdf`);
    } catch (error) {
      setPdfExportError(
        error instanceof Error ? error.message : "Не вдалося сформувати PDF.",
      );
    } finally {
      if (frozenStyles) {
        restoreFrozenStyles(frozenStyles);
      }

      setIsPdfExportPending(false);
    }
  }

  return (
    <>
      <OverviewDashboardScreen
        state={state}
        accessToken={accessToken}
        overview={overviewQuery.data}
        overviewTable={overviewTableQuery.data}
        isOverviewLoading={overviewQuery.isLoading}
        isOverviewFetching={overviewQuery.isFetching}
        overviewError={overviewQuery.error?.message ?? null}
        isOverviewTableLoading={overviewTableQuery.isLoading}
        isOverviewTableFetching={overviewTableQuery.isFetching}
        overviewTableError={overviewTableQuery.error?.message ?? null}
        onRetryOverview={() => {
          void overviewQuery.refetch();
        }}
        onRetryOverviewTable={() => {
          void overviewTableQuery.refetch();
        }}
        onUpdateOverviewFilters={updateOverviewFilters}
        onUpdateTableState={updateTableState}
        onResetFilters={resetFilters}
        onExportPdf={() => {
          void exportPdf();
        }}
        isPdfExportPending={isPdfExportPending}
        pdfExportError={pdfExportError}
        onExport={(format) => exportMutation.mutate(format)}
        isExportPending={exportMutation.isPending}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-[-200vw] z-[-1] w-[1120px] overflow-hidden bg-background"
        style={exportThemeVariables}
      >
        <OverviewPrintScreen
          reportRef={exportReportRef}
          state={state}
          overview={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
          isFetching={overviewQuery.isFetching}
          error={overviewQuery.error?.message ?? null}
          filterLabels={printFilterLabels}
          onRetry={() => {
            void overviewQuery.refetch();
          }}
        />
      </div>
    </>
  );
}
