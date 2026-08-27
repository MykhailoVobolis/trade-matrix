import {
  BarChart3Icon,
  Building2Icon,
  MapPinnedIcon,
  UsersIcon,
} from "lucide-react";

import { DashboardKpiGrid } from "@/components/overview/dashboard-kpi-grid";
import type { OverviewResponse } from "@/lib/overview/overview-api";

const kpiCards = [
  {
    title: "Продажі з ПДВ",
    icon: BarChart3Icon,
    iconClassName: "bg-blue-500/10 text-blue-600",
    kind: "currency",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
    kind: "number",
  },
  {
    title: "Активні постачальники",
    icon: Building2Icon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
    kind: "number",
  },
  {
    title: "Регіони збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
    kind: "number",
  },
] as const;

export function OverviewKpiGrid({
  kpi,
  isLoading,
  error,
  comparisonEnabled = true,
  onRetry,
  printMode = false,
}: {
  kpi?: OverviewResponse["kpi"];
  isLoading: boolean;
  error: string | null;
  comparisonEnabled?: boolean;
  onRetry?: () => void;
  printMode?: boolean;
}) {
  const metrics = kpi
    ? [
        kpi.salesWithVat,
        kpi.activeBuyers,
        kpi.activeSuppliers,
        kpi.salesRegions,
      ]
    : [];

  return (
    <DashboardKpiGrid
      cards={kpiCards}
      metrics={metrics}
      isLoading={isLoading}
      error={error}
      comparisonEnabled={comparisonEnabled}
      onRetry={onRetry}
      printMode={printMode}
    />
  );
}
