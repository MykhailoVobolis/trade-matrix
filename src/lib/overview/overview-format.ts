import type {
  OverviewInsight,
  OverviewMetric,
  OverviewTableItem,
} from "@/lib/overview/overview-api";

export function formatCompactCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFullCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

export function formatDelta(metric: OverviewMetric) {
  if (!metric.hasComparablePrevious || metric.deltaPercent === null) {
    return "Немає даних для порівняння";
  }

  const sign = metric.deltaPercent > 0 ? "+" : "";
  return `${sign}${metric.deltaPercent.toFixed(1)}% vs попер. період`;
}

export function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("uk-UA").format(value);
}

export function formatQuantity(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFullPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

export function formatInsightPercent(
  value: number | string | null | undefined,
) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  const roundedValue = Math.round(numericValue * 10) / 10;

  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(1);
}

export function formatQuantityWithUnit(
  quantity: number | null | undefined,
  unit: string | null | undefined,
) {
  const formattedQuantity = formatQuantity(quantity);

  if (formattedQuantity === "—") {
    return formattedQuantity;
  }

  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
}

export function formatOverviewInsight(insight: OverviewInsight) {
  const payload = insight.payload;

  switch (insight.type) {
    case "SALES_CHANGE":
      return `Продажі змінились на ${payload.deltaPercent ?? "—"}% порівняно з попереднім періодом`;
    case "PURCHASES_CHANGE":
      return `Закупівлі змінились на ${payload.deltaPercent ?? "—"}% порівняно з попереднім періодом`;
    case "PEAK_SALES_PERIOD": {
      const amount = payload.amount;
      const numericAmount =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? Number(amount)
            : NaN;

      return Number.isFinite(numericAmount) && numericAmount > 0
        ? `Пік продажів — ${payload.periodLabel ?? "—"}`
        : "Пік продажів — —";
    }
    case "PEAK_PURCHASES_PERIOD":
      return `Пік закупівель — ${payload.periodLabel ?? "—"}`;
    case "BUYER_CONCENTRATION":
      return `TOP-5 покупців формують ${formatInsightPercent(payload.top5Share)}% продажів`;
    case "PRODUCT_CONCENTRATION":
      return `TOP-5 продуктів формують ${formatInsightPercent(payload.top5Share)}% продажів`;
    case "REGION_CONCENTRATION":
      return `TOP-5 регіонів збуту формують ${formatInsightPercent(payload.top5Share)}% продажів`;
    case "SUPPLIER_CONCENTRATION":
      return `TOP-5 постачальників формують ${formatInsightPercent(payload.top5Share)}% закупівель`;
    case "TOP_REGION":
      return `Найбільший регіон попиту — ${payload.regionName ?? "—"}`;
    case "TOP_UKTZED":
      return `УКТЗЕД ${payload.code ?? "—"} формує ${payload.share ?? "—"}% продажів`;
    default:
      return "Інсайт недоступний";
  }
}

export function formatOverviewTableCell(
  row: OverviewTableItem,
  key:
    | "period"
    | "buyerRegion"
    | "buyer"
    | "supplier"
    | "product"
    | "uktzed"
    | "quantity"
    | "unit"
    | "salesWithVat"
    | "purchasesWithVat"
    | "marketShare",
) {
  switch (key) {
    case "period":
      return row.period || "—";
    case "buyerRegion":
      return row.buyerRegionName || "Не визначено";
    case "buyer":
      return row.buyerName || "—";
    case "supplier":
      return row.supplierName || "—";
    case "product":
      return row.product || "—";
    case "uktzed":
      return row.uktzed || "—";
    case "quantity":
      return formatQuantity(row.quantity);
    case "unit":
      return row.unit || "—";
    case "salesWithVat":
      return formatCompactCurrency(row.salesWithVat);
    case "purchasesWithVat":
      return formatCompactCurrency(row.purchasesWithVat);
    case "marketShare":
      return formatPercent(row.marketShare);
  }
}
