"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

type ThemePreferenceRowProps = {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function ThemePreferenceRow({
  checked,
  disabled = false,
  onCheckedChange,
}: ThemePreferenceRowProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = checked ?? (mounted ? resolvedTheme === "dark" : false);

  function handleCheckedChange(nextChecked: boolean) {
    onCheckedChange?.(nextChecked);

    if (!onCheckedChange) {
      setTheme(nextChecked ? "dark" : "light");
    }
  }

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-border/80 bg-background px-5 py-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Theme</p>
        <p className="text-sm text-muted-foreground">
          Choose light or dark appearance.
        </p>
      </div>
      <Switch
        checked={isDark}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
