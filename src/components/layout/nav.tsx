"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitFork,
  Home,
  LayoutDashboard,
  NotebookTabs,
  PenTool,
  Search,
  Settings,
  SquarePen
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kb", label: "Knowledge Base", icon: BookOpen },
  { href: "/daily", label: "Daily", icon: CalendarDays },
  { href: "/topics", label: "Topics", icon: NotebookTabs },
  { href: "/blogs", label: "Blogs", icon: SquarePen },
  { href: "/board", label: "Boards", icon: PenTool },
  { href: "/revise", label: "Revise", icon: Brain },
  { href: "/graph", label: "Graph", icon: GitFork },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings }
] satisfies Array<{ href: Route; label: string; icon: typeof LayoutDashboard }>;

interface SidebarNavProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onToggleCollapse, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b",
          collapsed ? "justify-center px-0" : "gap-2 px-4"
        )}
      >
        <Home className="size-4 shrink-0 text-primary" aria-hidden />
        {!collapsed && <span className="text-sm font-semibold tracking-wide">DevWhisper</span>}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto">
        <div className={cn("grid gap-0.5 p-2", collapsed && "items-center")}>
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-9 items-center rounded-md text-sm transition-colors",
                  collapsed ? "justify-center px-0 w-9 mx-auto" : "gap-3 px-3",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / branding */}
      {!collapsed && (
        <div className="border-t p-3 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <BarChart3 className="size-3.5" aria-hidden />
            Recall OS
          </div>
          <p>Markdown-first memory compression, revision, and reconstruction.</p>
        </div>
      )}

      {/* Desktop collapse toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-10 items-center border-t text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed ? "justify-center" : "gap-2 px-4 text-xs"
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="size-4" aria-hidden />
              Collapse
            </>
          )}
        </button>
      )}
    </div>
  );
}
