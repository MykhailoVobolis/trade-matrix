import type { Metadata } from "next";

import { OverviewDashboardClient } from "@/components/overview/overview-dashboard-client";

export const metadata: Metadata = {
  title: "Overview | TradeMatrix",
};

export default function AppHomePage() {
  return <OverviewDashboardClient />;
}
