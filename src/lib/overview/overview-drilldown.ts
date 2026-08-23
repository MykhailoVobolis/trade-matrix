import type {
  OverviewFilterState,
  OverviewTimeGrain,
} from "@/lib/overview/overview-url-state";

type DrilldownTarget = "buyers" | "suppliers" | "products" | "regions";

function appendMultiValue(
  params: URLSearchParams,
  key: string,
  values: string[] | undefined,
) {
  if (!values?.length) {
    return;
  }

  Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).forEach((value) => {
    params.append(key, value);
  });
}

function appendCommonFilters(
  params: URLSearchParams,
  state: OverviewFilterState,
  timeGrain?: OverviewTimeGrain | "",
) {
  params.set("dateFrom", state.dateFrom);
  params.set("dateTo", state.dateTo);
  params.set("comparisonMode", state.comparisonMode);

  if (state.compareDateFrom) {
    params.set("compareDateFrom", state.compareDateFrom);
  }

  if (state.compareDateTo) {
    params.set("compareDateTo", state.compareDateTo);
  }

  if (timeGrain) {
    params.set("timeGrain", timeGrain);
  }
}

export function buildOverviewDrilldownHref({
  state,
  target,
  buyerTaxNumbers,
  supplierTaxNumbers,
  products,
  buyerRegionCodes,
}: {
  state: OverviewFilterState;
  target: DrilldownTarget;
  buyerTaxNumbers?: string[];
  supplierTaxNumbers?: string[];
  products?: string[];
  buyerRegionCodes?: string[];
}) {
  const params = new URLSearchParams();
  const path =
    target === "buyers" || target === "regions"
      ? "/app/buyers"
      : target === "suppliers"
        ? "/app/suppliers"
        : "/app/products";

  appendCommonFilters(params, state, state.timeGrain);

  appendMultiValue(params, "uktzed", state.uktzed);

  if (target === "buyers" || target === "regions") {
    appendMultiValue(params, "products", products ?? state.products);
    appendMultiValue(
      params,
      "buyerRegionCodes",
      buyerRegionCodes ?? state.buyerRegionCodes,
    );
    appendMultiValue(
      params,
      "buyerTaxNumbers",
      buyerTaxNumbers ?? state.buyerTaxNumbers,
    );
  }

  if (target === "suppliers") {
    appendMultiValue(params, "products", products ?? state.products);
    appendMultiValue(
      params,
      "buyerRegionCodes",
      buyerRegionCodes ?? state.buyerRegionCodes,
    );
    appendMultiValue(
      params,
      "supplierTaxNumbers",
      supplierTaxNumbers ?? state.supplierTaxNumbers,
    );
  }

  if (target === "products") {
    appendMultiValue(params, "products", products ?? state.products);
    appendMultiValue(
      params,
      "buyerRegionCodes",
      buyerRegionCodes ?? state.buyerRegionCodes,
    );
    appendMultiValue(
      params,
      "buyerTaxNumbers",
      buyerTaxNumbers ?? state.buyerTaxNumbers,
    );
    appendMultiValue(
      params,
      "supplierTaxNumbers",
      supplierTaxNumbers ?? state.supplierTaxNumbers,
    );
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
