import type { Metadata } from "next";
import {
  ArrowUpRightIcon,
  BarChart3Icon,
  Building2Icon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "TradeMatrix App",
};

const overviewCards = [
  {
    title: "Legal entities",
    value: "236",
    change: "+18 vs. last quarter",
    icon: Building2Icon,
  },
  {
    title: "Sales coverage",
    value: "€3.2B",
    change: "+14.2% vs. 2025",
    icon: BarChart3Icon,
  },
  {
    title: "Purchases",
    value: "€1.09B",
    change: "+9.7% vs. 2025",
    icon: ShoppingCartIcon,
  },
  {
    title: "Shared buyers",
    value: "128",
    change: "+6 connected entities",
    icon: UsersIcon,
  },
] as const;

const pipelineRows = [
  {
    entity: "TradeMatrix Oils LLC",
    market: "Domestic",
    sales: "€557.8M",
    purchases: "€143.5M",
    status: "Healthy",
  },
  {
    entity: "North Delta Commodities",
    market: "Export",
    sales: "€418.6M",
    purchases: "€121.7M",
    status: "Review",
  },
  {
    entity: "Agro Product Hub",
    market: "Domestic",
    sales: "€663.8M",
    purchases: "€136.1M",
    status: "Healthy",
  },
  {
    entity: "Linkor Distribution",
    market: "Mixed",
    sales: "€677.1M",
    purchases: "€126.6M",
    status: "Watchlist",
  },
] as const;

const activityItems = [
  "Sales route placeholders are ready for future drill-down screens.",
  "Sidebar active states are wired across all private routes.",
  "User menu now owns settings entry and theme controls.",
] as const;

const insights = [
  {
    title: "Coverage",
    description:
      "Use this area for top-level KPI snapshots and quick navigation.",
  },
  {
    title: "Cross-entity links",
    description:
      "Reserve this block for future shared buyers/suppliers insights.",
  },
  {
    title: "Product mix",
    description:
      "Placeholder for portfolio breakdown once real analytics land.",
  },
] as const;

export default function AppHomePage() {
  return (
    <section className="flex w-full flex-1 flex-col gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              TradeMatrix workspace
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Placeholder overview for the private area. It mirrors a dashboard
              composition without introducing business widgets, API data, or a
              separate header.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-sidebar-primary" />
            App shell ready for feature work
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} size="sm">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardDescription>{card.title}</CardDescription>
                    <CardTitle className="text-2xl">{card.value}</CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowUpRightIcon className="size-3.5 text-sidebar-primary" />
                  {card.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity pipeline</CardTitle>
              <CardDescription>
                Static placeholder for the central table area from the future
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineRows.map((row) => (
                    <TableRow key={row.entity}>
                      <TableCell className="font-medium">
                        {row.entity}
                      </TableCell>
                      <TableCell>{row.market}</TableCell>
                      <TableCell>{row.sales}</TableCell>
                      <TableCell>{row.purchases}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace progress</CardTitle>
              <CardDescription>
                Placeholder panel for future drill-down modules and recent
                activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activity">
                <TabsList variant="line">
                  <TabsTrigger value="activity">Recent activity</TabsTrigger>
                  <TabsTrigger value="modules">Upcoming modules</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="pt-4">
                  <div className="space-y-3">
                    {activityItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="modules" className="pt-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="font-medium">Sales drill-down</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Route exists. Real content lands in the next feature.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="font-medium">Uploads workflow</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Placeholder for ingestion and validation progress.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="font-medium">Cross analytics</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Reserved for linked-entity comparisons and charts.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick insights</CardTitle>
              <CardDescription>
                Right rail placeholder inspired by the draft dashboard layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <PackageIcon className="size-4 text-sidebar-primary" />
                    <p className="font-medium">{insight.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                App shell is ready for real modules to replace placeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Replace static KPIs with real analytics data sources.</p>
              <p>2. Connect Settings and Log out to auth/account flows.</p>
              <p>3. Add feature-specific dashboards to the existing routes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
