import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
    >
      <path
        d="M21.805 12.23c0-.75-.067-1.471-.192-2.163H12v4.093h5.498a4.703 4.703 0 0 1-2.04 3.087v2.562h3.307c1.936-1.782 3.04-4.41 3.04-7.579Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.756 0 5.07-.913 6.76-2.472l-3.307-2.562c-.913.611-2.08.972-3.453.972-2.652 0-4.899-1.79-5.703-4.197H2.88v2.645A10.206 10.206 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.297 13.74A6.139 6.139 0 0 1 5.978 12c0-.604.11-1.19.319-1.74V7.616H2.88A10.202 10.202 0 0 0 1.8 12c0 1.632.39 3.178 1.08 4.384l3.417-2.644Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.061c1.499 0 2.844.516 3.903 1.53l2.925-2.924C17.064 3.023 14.75 2 12 2a10.206 10.206 0 0 0-9.12 5.616l3.417 2.645C7.101 7.852 9.348 6.061 12 6.061Z"
        fill="#EA4335"
      />
    </svg>
  );
}

type AuthGoogleButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label?: string;
};

export function AuthGoogleButton({
  label = "Continue with Google",
  className,
  variant = "outline",
  size = "lg",
  ...props
}: AuthGoogleButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-12 w-full justify-center gap-2.5 rounded-xl text-base",
        className,
      )}
      {...props}
    >
      <GoogleIcon />
      <span>{label}</span>
    </Button>
  );
}
