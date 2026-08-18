import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

export function AuthBrand() {
  return (
    <Link
      href="/app"
      className="inline-flex w-fit items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <LayoutDashboardIcon className="size-5" />
      </div>
      <span className="text-[28px] leading-none font-semibold tracking-tight">
        TradeMatrix
      </span>
    </Link>
  );
}
