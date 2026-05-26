import Link from "next/link";
import { ArrowRight, BookOpen, Brain, CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { listNotes, listPinnedNotes, getRevisionQueue } from "@/features/kb/repository";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  seed: "bg-yellow-400/10 text-yellow-400",
  growing: "bg-emerald-400/10 text-emerald-400",
  evergreen: "bg-teal-400/10 text-teal-400"
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [recent, pinned, queue] = await Promise.all([
    listNotes(user.id, 8),
    listPinnedNotes(user.id),
    getRevisionQueue(user.id)
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        eyebrow="Memory OS"
        description="A compressed view of what you are learning, what is decaying, and what needs reconstruction."
        actions={
          <Button asChild>
            <Link href="/kb/new">
              <Plus className="size-4" aria-hidden />
              New note
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="size-3.5" aria-hidden />
            Active notes
          </div>
          <p className="text-3xl font-semibold">{recent.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="size-3.5" aria-hidden />
            Due for revision
          </div>
          <p className="text-3xl font-semibold">{queue.length}</p>
          {queue.length > 0 && (
            <Link href="/revise" className="mt-1 flex items-center gap-1 text-xs text-primary">
              Start session
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            Pinned concepts
          </div>
          <p className="text-3xl font-semibold">{pinned.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent notes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent notes</h2>
            <Link href="/kb" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {recent.length ? (
            <div className="grid gap-2">
              {recent.map((note) => (
                <Link
                  key={note.id}
                  href={`/kb/${note.slug}`}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{note.title}</div>
                    {note.shortSummary && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {note.shortSummary}
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${statusColor[note.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {note.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No notes yet.</p>
              <Link href="/kb/new" className="mt-2 text-xs text-primary">
                Create your first note
              </Link>
            </div>
          )}
        </section>

        {/* Revision queue preview */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Revision queue</h2>
            <Link href="/revise" className="text-xs text-muted-foreground hover:text-foreground">
              Start revising
            </Link>
          </div>
          {queue.length ? (
            <div className="grid gap-2">
              {queue.slice(0, 6).map((note) => (
                <Link
                  key={note.id}
                  href={`/kb/${note.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">{note.title}</div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="block h-1.5 w-12 overflow-hidden rounded-full bg-muted"
                      title={`Forgetting: ${(note.forgettingScore * 100).toFixed(0)}%`}
                    >
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{
                          width: `${Math.min(100, note.forgettingScore * 100).toFixed(0)}%`
                        }}
                      />
                    </span>
                    <span>{(note.forgettingScore * 100).toFixed(0)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">Queue is clear — nothing due.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
