import Link from "next/link";
import { Plus } from "lucide-react";
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

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

export default async function KnowledgeBasePage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listNotes(),
    listArchivedNotes(),
    listTrashedNotes()
  ]);

  const notes = view === "archive" ? archived : view === "bin" ? trashed : active;

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="Markdown-first concept memory with summaries, backlinks, status, and revision metadata."
        actions={
          <Button asChild>
            <Link href="/kb/new">
              <Plus className="size-4" aria-hidden />
              Capture
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
        <div className="grid gap-2">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start justify-between rounded-lg border p-4">
              <Link href={`/kb/${note.slug}`} className="flex-1 hover:underline">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{note.title}</h2>
                  <Badge>{note.status}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {note.shortSummary || note.mediumSummary || "No summary yet."}
                </p>
              </Link>
              {view === "bin" ? (
                <BinControls
                  onRestore={() => restoreNoteAction(note.id)}
                  onPermanentDelete={() => permanentDeleteNoteAction(note.id)}
                />
              ) : view === "archive" ? (
                <ArchiveButton
                  isArchived
                  onArchive={async () => {}}
                  onUnarchive={() => unarchiveNoteAction(note.id)}
                />
              ) : null}
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
