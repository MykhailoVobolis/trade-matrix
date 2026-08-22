import type { Metadata } from "next";

import { OverviewDashboardScreen } from "@/components/overview/overview-dashboard-screen";

export const metadata: Metadata = {
  title: "Overview | TradeMatrix",
};

export default function AppHomePage() {
  return <OverviewDashboardScreen />;
}
