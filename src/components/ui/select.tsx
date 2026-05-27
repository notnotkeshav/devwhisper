"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Select({
  name,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  children,
  className
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixSelect.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      <RadixSelect.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-muted-foreground" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-card shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <RadixSelect.ScrollUpButton className="flex cursor-pointer items-center justify-center py-1 text-muted-foreground">
            <ChevronDown className="size-3 rotate-180" />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex cursor-pointer items-center justify-center py-1 text-muted-foreground">
            <ChevronDown className="size-3" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function SelectItem({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-3 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check className="size-3.5 text-primary" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
