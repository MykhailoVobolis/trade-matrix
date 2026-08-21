import type { Metadata } from "next";

import { TablesScreen } from "@/components/tables/tables-screen";

export const metadata: Metadata = {
  title: "Tables | TradeMatrix",
};

export default function TablesPage() {
  return <TablesScreen />;
}
