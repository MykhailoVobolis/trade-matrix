import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AuthDividerProps = {
  label?: string;
  className?: string;
};

export function AuthDivider({ label = "or", className }: AuthDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Separator className="flex-1" />
      <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
