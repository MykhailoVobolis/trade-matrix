import {
  ActivityIcon,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  MapPinnedIcon,
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
import { Skeleton } from "@/components/ui/skeleton";

const kpiCards = [
  {
    title: "Продажі з ПДВ",
    icon: BarChart3Icon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Закупівлі з ПДВ",
    icon: ShoppingCartIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Сальдо продажі / закупівлі",
    icon: ActivityIcon,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Активні покупці",
    icon: UsersIcon,
    iconClassName: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Активні постачальники",
    icon: BriefcaseBusinessIcon,
    iconClassName: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Регіони збуту",
    icon: MapPinnedIcon,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

export function OverviewKpiGrid() {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-6">
      {kpiCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            size="sm"
            className="border border-border/70 shadow-none"
          >
            <CardHeader className="gap-2 pb-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <CardDescription className="text-[0.78rem] leading-snug">
                    {card.title}
                  </CardDescription>
                  <CardTitle>
                    <Skeleton className="h-8 w-24" />
                  </CardTitle>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-md ${card.iconClassName}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
