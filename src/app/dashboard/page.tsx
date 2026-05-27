import Link from "next/link";
import { BookOpen, CalendarDays, NotebookTabs, Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { listNotes, listPinnedNotes, countActiveNotes } from "@/features/kb/repository";
import { listTopics } from "@/features/topics/repository";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  seed: "bg-yellow-400/10 text-yellow-400",
  growing: "bg-emerald-400/10 text-emerald-400",
  evergreen: "bg-teal-400/10 text-teal-400"
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [recent, pinned, topics, totalNotes] = await Promise.all([
    listNotes(user.id, 8),
    listPinnedNotes(user.id),
    listTopics(user.id),
    countActiveNotes(user.id)
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Your personal learning system — capture, connect, and recall."
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
          <p className="text-3xl font-semibold">{totalNotes}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <NotebookTabs className="size-3.5" aria-hidden />
            Topics
          </div>
          <p className="text-3xl font-semibold">{topics.length}</p>
          {topics.length > 0 && (
            <Link href="/topics" className="mt-1 flex items-center gap-1 text-xs text-primary">
              View topics →
            </Link>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            Pinned notes
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
                    {capitalize(note.status)}
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

        {/* Pinned notes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pinned notes</h2>
            <Link href="/kb" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {pinned.length ? (
            <div className="grid gap-2">
              {pinned.map((note) => (
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
                    {capitalize(note.status)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No pinned notes yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pin important notes from the note view to surface them here.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
