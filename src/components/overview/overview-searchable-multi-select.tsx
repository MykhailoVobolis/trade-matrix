"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  LoaderCircleIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";

import type { OverviewFilterOption } from "@/lib/overview/overview-api";
import { OverflowTooltipText } from "@/components/overview/overflow-tooltip-text";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
type OverviewSearchableMultiSelectProps = {
  label: string;
  placeholder: string;
  disabled?: boolean;
  selectedValues: string[];
  selectedLabels?: Record<string, string>;
  options: OverviewFilterOption[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onChange: (values: string[]) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  popupMinWidth?: number;
};

function getTriggerLabel({
  selectedValues,
  selectedLabels,
  placeholder,
}: {
  selectedValues: string[];
  selectedLabels?: Record<string, string>;
  placeholder: string;
}) {
  if (selectedValues.length === 0) {
    return placeholder;
  }

  if (selectedValues.length === 1) {
    return selectedLabels?.[selectedValues[0]] ?? selectedValues[0];
  }

  return `${selectedValues.length} обрано`;
}

export function OverviewSearchableMultiSelect({
  label,
  placeholder,
  disabled = false,
  selectedValues,
  selectedLabels,
  options,
  isLoading,
  isError,
  errorMessage,
  searchValue,
  onSearchChange,
  onChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  popupMinWidth = 340,
}: OverviewSearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [popupStyle, setPopupStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const mergedOptions = useMemo(() => {
    const map = new Map<string, OverviewFilterOption>();

    options.forEach((option) => {
      map.set(option.value, option);
    });

    selectedValues.forEach((value) => {
      if (!map.has(value)) {
        map.set(value, {
          value,
          label: selectedLabels?.[value] ?? value,
        });
      }
    });

    return Array.from(map.values());
  }, [options, selectedLabels, selectedValues]);
  const triggerLabel = getTriggerLabel({
    selectedValues,
    selectedLabels,
    placeholder,
  });
  const isPopupOpen = isOpen && !disabled;

  useEffect(() => {
    if (!isPopupOpen) {
      onSearchChange("");
    }
  }, [isPopupOpen, onSearchChange]);

  useEffect(() => {
    if (!isPopupOpen) {
      return;
    }

    const updatePopupPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const popupWidth = Math.max(rect.width, popupMinWidth);
      const viewportWidth = window.innerWidth;
      const horizontalPadding = 16;
      const nextLeft = Math.min(
        Math.max(horizontalPadding, rect.left),
        viewportWidth - popupWidth - horizontalPadding,
      );

      setPopupStyle({
        top: rect.bottom + 6,
        left: nextLeft,
        width: popupWidth,
      });
    };

    updatePopupPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopupOpen, popupMinWidth]);

  const handleListScroll = () => {
    const listElement = listRef.current;

    if (
      !listElement ||
      !isPopupOpen ||
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      !onLoadMore
    ) {
      return;
    }

    const distanceToBottom =
      listElement.scrollHeight -
      listElement.scrollTop -
      listElement.clientHeight;

    if (distanceToBottom <= 48) {
      onLoadMore();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        onClick={() => {
          if (disabled) {
            return;
          }

          setIsOpen((open) => !open);
        }}
        className="block w-full text-left"
      >
        <span className="block w-full">
          <span
            className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm shadow-sm shadow-black/[0.02] transition-colors aria-expanded:border-sidebar-primary/30 aria-expanded:bg-accent/30 ${
              disabled
                ? "cursor-default border-border/60 bg-muted/35 text-muted-foreground"
                : "border-border/70 bg-background text-foreground"
            }`}
          >
            <OverflowTooltipText text={triggerLabel} className="truncate" />
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </span>
        </span>
      </button>

      {isPopupOpen && popupStyle
        ? createPortal(
            <div
              ref={popupRef}
              className="fixed z-50 rounded-lg bg-popover p-0 text-popover-foreground shadow-md ring-1 ring-foreground/10"
              style={{
                top: popupStyle.top,
                left: popupStyle.left,
                width: popupStyle.width,
              }}
            >
              <Command className="rounded-lg!">
                <CommandInput
                  value={searchValue}
                  onValueChange={onSearchChange}
                  placeholder={`Пошук: ${label.toLowerCase()}...`}
                />
                <CommandList ref={listRef} onScroll={handleListScroll}>
                  {isLoading ? (
                    <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                      <LoaderCircleIcon className="size-4 animate-spin" />
                      Завантажуємо варіанти...
                    </div>
                  ) : null}

                  {!isLoading && isError ? (
                    <div className="px-3 py-6 text-sm text-destructive">
                      {errorMessage || "Не вдалося завантажити варіанти."}
                    </div>
                  ) : null}

                  {!isLoading && !isError ? (
                    <>
                      <CommandEmpty>Нічого не знайдено.</CommandEmpty>
                      <CommandGroup heading="Варіанти">
                        {mergedOptions.map((option) => {
                          const checked = selectedValues.includes(option.value);

                          return (
                            <CommandItem
                              key={option.value}
                              value={`${option.label} ${option.value}`}
                              data-checked={checked}
                              className="items-start gap-3 rounded-md px-3 py-2 data-selected:bg-sidebar-accent data-selected:text-sidebar-accent-foreground"
                              onSelect={() => {
                                onChange(
                                  checked
                                    ? selectedValues.filter(
                                        (value) => value !== option.value,
                                      )
                                    : [...selectedValues, option.value],
                                );
                              }}
                            >
                              <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-sidebar-primary/30 bg-background">
                                {checked ? (
                                  <CheckIcon className="size-3 text-sidebar-primary" />
                                ) : (
                                  <SquareIcon className="size-3 text-transparent" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <OverflowTooltipText
                                  text={option.label}
                                  className="block whitespace-normal break-words leading-snug"
                                />
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>

                      {hasMore || isLoadingMore ? (
                        <div className="border-t border-border/70 px-3 py-3">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon
                              className={`size-4 ${isLoadingMore ? "animate-spin" : ""}`}
                            />
                            <span>
                              {isLoadingMore
                                ? "Завантажуємо ще..."
                                : "Прокрутіть, щоб завантажити ще"}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </CommandList>
              </Command>

              <div className="flex items-center justify-between gap-2 border-t border-border/70 p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={selectedValues.length === 0}
                  onClick={() => onChange([])}
                >
                  <XIcon />
                  Очистити
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedValues.length} обрано
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
