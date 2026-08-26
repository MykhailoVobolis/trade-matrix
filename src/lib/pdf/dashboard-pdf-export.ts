import type { CSSProperties } from "react";

type FrozenStyleSnapshot = Array<{
  element: HTMLElement;
  styleAttribute: string | null;
}>;

export const exportThemeVariables = {
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
} satisfies CSSProperties & Record<string, string>;

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

export async function exportDashboardPdf({
  exportNode,
  fileName,
}: {
  exportNode: HTMLElement;
  fileName: string;
}) {
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

  let frozenStyles: FrozenStyleSnapshot | null = null;

  try {
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

      pdf.addImage(
        pageCanvas.toDataURL("image/png"),
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

    pdf.save(fileName);
  } finally {
    if (frozenStyles) {
      restoreFrozenStyles(frozenStyles);
    }
  }
}
