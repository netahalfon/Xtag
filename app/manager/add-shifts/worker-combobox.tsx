"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Worker = {
  id: string;
  email: string;
  full_name: string;
};

type Props = {
  workers: Worker[];
  value: string; // workerId
  onChange: (workerId: string) => void;

  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
};

export function WorkerCombobox({
  workers,
  value,
  onChange,
  label = "עובד",
  placeholder = "בחר עובד",
  disabled,
  error,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => workers.find((w) => w.id === value),
    [workers, value]
  );

  return (
    <div className="space-y-2">
      <Label className="text-slate-700 dark:text-slate-300">{label}</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between border-slate-200 bg-white dark:bg-slate-900",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          >
            {selected ? (
              <div className="flex flex-col text-right">
                <span className="font-medium">{selected.full_name}</span>
                <span className="text-xs text-slate-500">{selected.email}</span>
              </div>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}

            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder="חיפוש לפי שם / מייל..." />
            <CommandList>
              <CommandEmpty>לא נמצאו עובדים</CommandEmpty>
              <CommandGroup>
                {workers.map((w) => (
                  <CommandItem
                    key={w.id}
                    value={`${w.full_name} ${w.email}`}
                    onSelect={() => {
                      onChange(w.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{w.full_name}</span>
                        <span className="text-xs text-slate-500">{w.email}</span>
                      </div>

                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === w.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
