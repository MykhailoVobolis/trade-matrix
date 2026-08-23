"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OverflowTooltipText({
  text,
  value,
  className,
  content,
}: {
  text?: string;
  value?: string;
  className?: string;
  content?: ReactNode;
}) {
  const displayText = text ?? value ?? "";
  const [element, setElement] = useState<HTMLSpanElement | null>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    if (!element) {
      return;
    }

    const updateOverflowState = () => {
      const nextIsOverflowed =
        element.scrollWidth > element.clientWidth + 1 ||
        element.scrollHeight > element.clientHeight + 1;

      setIsOverflowed((current) =>
        current === nextIsOverflowed ? current : nextIsOverflowed,
      );
    };

    const resizeObserver = new ResizeObserver(() => {
      updateOverflowState();
    });

    resizeObserver.observe(element);

    const animationFrameId = window.requestAnimationFrame(() => {
      updateOverflowState();
    });

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [displayText, element]);

  const trigger = (
    <span ref={setElement} className={className}>
      {displayText}
    </span>
  );

  if (!isOverflowed) {
    return trigger;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent>{content ?? displayText}</TooltipContent>
    </Tooltip>
  );
}
