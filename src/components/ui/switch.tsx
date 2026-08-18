"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Switch({
  checked = false,
  onCheckedChange,
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn(
        "peer relative ml-auto inline-flex h-4.5 w-8 shrink-0 rounded-full bg-neutral-300 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-600 data-[state=checked]:bg-sidebar-primary dark:data-[state=checked]:bg-sidebar-primary",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.(event);
        onCheckedChange?.(!checked);
      }}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute top-0.5 size-3.5 rounded-full bg-white shadow ring-0 transition-all duration-200 ease-in-out",
        )}
        data-state={checked ? "checked" : "unchecked"}
        style={{
          left: checked ? "1rem" : "0.125rem",
        }}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

export { Switch };
