"use client";

import Link from "next/link";
import type { Route } from "next";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookOpen, CalendarDays, GitFork, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommandPalette } from "@/hooks/use-command-palette";

const commands = [
  { href: "/kb/new", label: "Quick capture note", icon: BookOpen },
  { href: "/daily", label: "Open today", icon: CalendarDays },
  { href: "/graph", label: "Knowledge graph", icon: GitFork },
  { href: "/search", label: "Global search", icon: Search }
] satisfies Array<{ href: Route; label: string; icon: typeof BookOpen }>;

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border bg-card p-3 shadow-2xl">
          <VisuallyHidden>
            <Dialog.Title>Command palette</Dialog.Title>
          </VisuallyHidden>
          <div className="flex items-center gap-2">
            <Input autoFocus placeholder="Run command or search..." className="h-10" />
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close command palette">
                <X className="size-4" aria-hidden />
              </Button>
            </Dialog.Close>
          </div>
          <div className="mt-3 grid gap-1">
            {commands.map((command) => (
              <Dialog.Close asChild key={command.href}>
                <Link
                  href={command.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <command.icon className="size-4" aria-hidden />
                  {command.label}
                </Link>
              </Dialog.Close>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
