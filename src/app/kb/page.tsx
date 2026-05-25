import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { listNotes } from "@/features/kb/repository";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const notes = await listNotes();

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
      {notes.length ? (
        <div className="grid gap-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/kb/${note.slug}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{note.title}</h2>
                <Badge>{note.status}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {note.shortSummary || note.mediumSummary || "No summary yet."}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No KB notes"
          body="Create compressed markdown notes with [[wiki links]] to generate backlinks."
        />
      )}
    </>
  );
}
