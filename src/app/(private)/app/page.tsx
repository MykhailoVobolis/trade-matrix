import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMatrix App",
};

export default function AppHomePage() {
  return (
    <main className="flex w-full flex-1 items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
    </main>
  );
}
