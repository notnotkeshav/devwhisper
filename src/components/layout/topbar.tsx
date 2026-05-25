"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Command, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [query, setQuery] = useState("");
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur md:px-4">
      {/* Mobile hamburger */}
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-4" aria-hidden />
      </Button>

      <form action="/search" className="relative min-w-0 flex-1">
        <Input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, topics, boards…"
          className="h-9 pl-3"
        />
      </form>

      <Button asChild size="sm" variant="secondary" className="shrink-0">
        <Link href="/kb/new">
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Capture</span>
        </Link>
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="Open command palette (Ctrl+K)"
        className="shrink-0"
      >
        <Command className="size-4" aria-hidden />
      </Button>
    </header>
  );
}
