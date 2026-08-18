import { cn } from "@/lib/utils";

type AuthScreenHeaderProps = {
  title: string;
  description: string;
  className?: string;
};

export function AuthScreenHeader({
  title,
  description,
  className,
}: AuthScreenHeaderProps) {
  return (
    <div className={cn("space-y-2 text-center lg:text-left", className)}>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
