import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const setupKey = "EQQNMKTBY3MF4DWFYITCIWM5YM2FFBZJ";

export default function SetupTwoFactorPage() {
  return (
    <AuthWithVisualLayout
      title={
        <>
          Set-up 2-Factor
          <br />
          Authentication App
        </>
      }
      description="Scan the QR code in your authenticator app, then enter the first 6-digit code to finish setup."
      topAction={
        <Button
          nativeButton={false}
          render={<Link href="/app/settings?tab=Security" />}
          variant="outline"
          size="lg"
          className="w-fit rounded-xl px-5"
        >
          <ChevronLeftIcon className="size-4" />
          Back
        </Button>
      }
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-border/80 bg-background p-6 text-center shadow-sm">
            <div className="mx-auto flex w-fit flex-col items-center gap-6">
              <div className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-sm">
                <div className="grid size-48 grid-cols-7 gap-1">
                  {Array.from({ length: 49 }).map((_, index) => {
                    const filledCells = new Set([
                      0, 1, 2, 4, 6, 7, 10, 12, 14, 15, 16, 19, 20, 21, 23, 25,
                      27, 28, 30, 32, 33, 34, 35, 37, 39, 41, 42, 44, 46, 47,
                      48,
                    ]);

                    return (
                      <div
                        key={index}
                        className={
                          filledCells.has(index)
                            ? "rounded-[2px] bg-black"
                            : "rounded-[2px] bg-white"
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-lg leading-none font-medium tracking-tight">
                  Can&apos;t scan the code?
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use this setup key in your authenticator app:
                  </p>
                  <p className="font-mono text-[1.05rem] tracking-[0.08em] text-foreground">
                    {setupKey}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  aria-label={`Setup verification digit ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="0"
                  className="h-18 rounded-2xl border-border/80 bg-background px-0 text-center text-4xl font-medium placeholder:font-medium placeholder:text-muted-foreground/45 md:text-4xl"
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl bg-primary/45 text-base text-primary-foreground hover:bg-primary/55"
        >
          Confirm Code
        </Button>
      </AuthFormShell>
    </AuthWithVisualLayout>
  );
}
