import type { CSSProperties } from "react";

type FrozenStyleSnapshot = Array<{
  element: HTMLElement | SVGElement;
  styleAttribute: string | null;
  attributes: Array<{
    name: string;
    value: string | null;
  }>;
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
let domColorResolver: HTMLSpanElement | null = null;

function getDomColorResolver() {
  if (domColorResolver && document.body.contains(domColorResolver)) {
    return domColorResolver;
  }

  const resolver = document.createElement("span");
  resolver.setAttribute("aria-hidden", "true");
  resolver.style.position = "fixed";
  resolver.style.pointerEvents = "none";
  resolver.style.opacity = "0";
  resolver.style.inset = "0";
  resolver.style.width = "0";
  resolver.style.height = "0";
  resolver.style.overflow = "hidden";
  document.body.appendChild(resolver);
  domColorResolver = resolver;
  return resolver;
}

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

  if (
    trimmedValue.includes("var(") ||
    trimmedValue.includes("oklch(") ||
    trimmedValue.includes("oklab(") ||
    trimmedValue.includes("lab(") ||
    trimmedValue.includes("lch(") ||
    trimmedValue.includes("color-mix(")
  ) {
    const resolver = getDomColorResolver();
    resolver.style.color = "";

    try {
      resolver.style.color = trimmedValue;
      const resolvedValue = window.getComputedStyle(resolver).color;

      if (resolvedValue) {
        return resolvedValue;
      }
    } catch {
      return trimmedValue;
    }
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
    ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>("*")),
  ];
  const svgColorAttributes = [
    "fill",
    "stroke",
    "stop-color",
    "flood-color",
    "lighting-color",
    "color",
  ] as const;

  for (const element of elements) {
    const attributes =
      element instanceof SVGElement
        ? svgColorAttributes.map((name) => ({
            name,
            value: element.getAttribute(name),
          }))
        : [];

    snapshot.push({
      element,
      styleAttribute: element.getAttribute("style"),
      attributes,
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

    if (element instanceof SVGElement) {
      for (const attribute of svgColorAttributes) {
        const currentValue = element.getAttribute(attribute);

        if (!currentValue) {
          continue;
        }

        const normalizedAttributeColor = normalizeCssColor(currentValue);

        if (
          normalizedAttributeColor &&
          normalizedAttributeColor !== currentValue
        ) {
          element.setAttribute(attribute, normalizedAttributeColor);
        }
      }

      const svgColorProperties = [
        { attribute: "fill", property: "fill" },
        { attribute: "stroke", property: "stroke" },
        { attribute: "stop-color", property: "stop-color" },
        { attribute: "flood-color", property: "flood-color" },
        { attribute: "lighting-color", property: "lighting-color" },
        { attribute: "color", property: "color" },
      ] as const;

      for (const { attribute, property } of svgColorProperties) {
        const computedValue = computed.getPropertyValue(property);

        if (computedValue) {
          element.setAttribute(attribute, normalizeCssColor(computedValue));
        }
      }
    }
  }

  return snapshot;
}

function restoreFrozenStyles(snapshot: FrozenStyleSnapshot) {
  for (const item of snapshot) {
    if (item.styleAttribute === null) {
      item.element.removeAttribute("style");
    } else {
      item.element.setAttribute("style", item.styleAttribute);
    }

    if (item.element instanceof SVGElement) {
      for (const attribute of item.attributes) {
        if (attribute.value === null) {
          item.element.removeAttribute(attribute.name);
          continue;
        }

        item.element.setAttribute(attribute.name, attribute.value);
      }
    }
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
