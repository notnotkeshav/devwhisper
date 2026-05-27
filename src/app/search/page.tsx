import Link from "next/link";
import type { Route } from "next";
import { BookOpen, CalendarDays, FileText, LayoutDashboard, Search } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/lib/search/repository";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const typeConfig = {
  note: { label: "Note", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  blog: { label: "Blog", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  board: { label: "Board", icon: LayoutDashboard, color: "text-amber-400", bg: "bg-amber-400/10" },
  topic: { label: "Topic", icon: CalendarDays, color: "text-purple-400", bg: "bg-purple-400/10" }
} as const;

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const results = await globalSearch(q, user.id);

  const hrefFor = (result: (typeof results)[number]): Route => {
    if (result.type === "note") return `/kb/${result.slug}` as Route;
    if (result.type === "board") return `/boards/${result.id}` as Route;
    return `/${result.type}s/${result.slug}` as Route;
  };

  return (
    <>
      <PageHeader
        title="Search"
        description="Full-text search across notes, blogs, boards, and topics."
      />

      <div className="grid gap-1.5">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search by title, content, or concept…"
              className="pl-9"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" aria-hidden />
            Search
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1 py-0.5 text-[10px]">Enter</kbd> or click
          Search. Partial words work — &ldquo;rea&rdquo; matches &ldquo;react&rdquo;,
          &ldquo;read&rdquo;, etc.
        </p>
      </div>

      {q && (
        <p className="text-sm text-muted-foreground">
          {results.length
            ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`
            : `No results for "${q}"`}
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid gap-2">
          {results.map((result) => {
            const cfg = typeConfig[result.type as keyof typeof typeConfig] ?? typeConfig.note;
            const Icon = cfg.icon;
            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={hrefFor(result)}
                className="group flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${cfg.bg}`}
                >
                  <Icon className={`size-4 ${cfg.color}`} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold group-hover:text-primary">
                      {result.title}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {result.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {result.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : q ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Search className="mx-auto mb-3 size-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm font-medium">No results found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword, or check your spelling.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Search className="mx-auto mb-3 size-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm font-medium">Start searching</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Search across all your notes, blogs, boards, and topics.
          </p>
        </div>
      )}
    </>
  );
}
