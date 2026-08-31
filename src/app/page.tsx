import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const featureItems = [
  {
    title: "Sales and procurement analytics",
    description:
      "Track market activity, compare counterparties, and review trends across shared dashboard screens.",
    icon: BarChart3Icon,
  },
  {
    title: "Private workspace access",
    description:
      "Open the secured application area and continue with the authenticated workflow in one click.",
    icon: ShieldCheckIcon,
  },
] as const;

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <section className="flex flex-1 items-center">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-4 shadow-sm shadow-black/[0.03]">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboardIcon className="size-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[30px] leading-none font-semibold tracking-tight">
                    TradeMatrix
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Private workspace for market analytics
                  </p>
                </div>
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
                  The public landing page is still in progress.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  The application workspace is already available. Open the main
                  dashboard area to continue with tables, overview analytics,
                  buyers, suppliers, and products.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/app"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      className: "h-12 gap-2 rounded-xl px-5 text-base",
                    }),
                  )}
                >
                  Open workspace
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>

            <Card className="h-full border border-border/70 bg-card/95 shadow-sm shadow-black/[0.04]">
              <CardHeader className="border-b border-border/70">
                <CardTitle>Workspace status</CardTitle>
                <CardDescription>
                  The core product is ready to use even before the marketing
                  landing page is published.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-center space-y-4 pt-4">
                {featureItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-xl border border-border/70 bg-background/80 p-4"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
