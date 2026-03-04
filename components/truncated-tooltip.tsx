"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TruncatedTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate max-w-full cursor-pointer">{text}</span>
      </TooltipTrigger>
      <TooltipContent side="top" dir="rtl">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
