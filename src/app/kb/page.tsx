import Link from "next/link";
import { Plus } from "lucide-react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { listNotes, listArchivedNotes, listTrashedNotes } from "@/features/kb/repository";
import { BinControls, ArchiveButton } from "@/features/shared/item-controls";
import {
  restoreNoteAction,
  permanentDeleteNoteAction,
  unarchiveNoteAction
} from "@/features/kb/actions";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

const statusColor: Record<string, string> = {
  seed: "bg-yellow-400/10 text-yellow-400",
  growing: "bg-emerald-400/10 text-emerald-400",
  evergreen: "bg-teal-400/10 text-teal-400"
};

export default async function KnowledgeBasePage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listNotes(user.id),
    listArchivedNotes(user.id),
    listTrashedNotes(user.id)
  ]);

  const notes = view === "archive" ? archived : view === "bin" ? trashed : active;

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="Markdown-first notes with summaries, backlinks, wiki links, and topic grouping."
        actions={
          <Button asChild>
            <Link href="/kb/new">
              <Plus className="size-4" aria-hidden />
              New note
            </Link>
          </Button>
        }
      />

      <div className="flex gap-1 rounded-lg border p-1 self-start">
        {(
          [
            { id: "active", label: `Active (${active.length})` },
            { id: "archive", label: `Archive (${archived.length})` },
            { id: "bin", label: `Bin (${trashed.length})` }
          ] as const
        ).map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "active" ? "/kb" : `/kb?view=${tab.id}`}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {notes.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={`/kb/${note.slug}`} className="flex-1">
                    <h2 className="text-sm font-semibold leading-snug hover:text-primary">
                      {note.title}
                    </h2>
                  </Link>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${statusColor[note.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {capitalize(note.status)}
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">
                  {note.shortSummary || note.mediumSummary || "No summary yet."}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
                {view === "bin" ? (
                  <BinControls
                    onRestore={restoreNoteAction.bind(null, note.id)}
                    onPermanentDelete={permanentDeleteNoteAction.bind(null, note.id)}
                  />
                ) : view === "archive" ? (
                  <ArchiveButton isArchived onUnarchive={unarchiveNoteAction.bind(null, note.id)} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            view === "bin"
              ? "Bin is empty"
              : view === "archive"
                ? "No archived notes"
                : "No KB notes"
          }
          body={
            view === "active"
              ? "Create compressed markdown notes with [[wiki links]] to generate backlinks."
              : view === "archive"
                ? "Archived notes are hidden from the active list but kept for reference."
                : "Deleted notes appear here. Restore or permanently delete them."
          }
        />
      )}
    </>
  );
}
