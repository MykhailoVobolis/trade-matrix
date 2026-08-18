import {
  ArrowUpRightIcon,
  Building2Icon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const visualHighlights = [
  {
    title: "Entity visibility",
    description:
      "Monitor counterparties, products, and trade signals from one structured workspace.",
    icon: Building2Icon,
  },
  {
    title: "Secure access",
    description:
      "Support verification, recovery, and two-factor security without breaking the product shell.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Shared context",
    description:
      "Keep session state, navigation context, and user identity aligned across the platform.",
    icon: UsersIcon,
  },
] as const;

export function AuthVisualPanel() {
  return (
    <div className="hidden min-w-0 flex-1 xl:flex">
      <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(48,128,255,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,255,0.88))] p-8 shadow-sm dark:bg-[radial-gradient(circle_at_top_left,rgba(48,128,255,0.24),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,15,27,0.92))]">
        <div className="space-y-3 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sidebar-primary/10 px-3 py-1 text-xs font-medium text-sidebar-primary">
            <span className="size-2 rounded-full bg-sidebar-primary" />
            Private analytics workspace
          </div>
          <h2 className="max-w-lg text-4xl leading-tight font-semibold tracking-tight">
            Access the TradeMatrix workspace with a consistent auth experience.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            TradeMatrix authentication screens use the same visual system as the
            private analytics shell, with focused flows for access, recovery,
            and verification.
          </p>
        </div>

        <div className="grid gap-4">
          {visualHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                size="sm"
                className="bg-background/75 backdrop-blur-sm"
              >
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
                      <Icon className="size-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <ArrowUpRightIcon className="size-3.5 text-sidebar-primary" />
                    TradeMatrix access system
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
