"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SidebarNav } from "./nav";
import { Topbar } from "./topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils/cn";

const COLLAPSED_KEY = "sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "true"
  );

  function toggleCollapse() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, String(!prev));
      return !prev;
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r bg-background/80 transition-all duration-200 md:flex md:flex-col sticky top-0 h-screen self-start",
          collapsed ? "w-14" : "w-56"
        )}
      >
        <SidebarNav collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r bg-background md:hidden">
            <button
              className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
