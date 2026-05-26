import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBacklinks, getNoteBySlug } from "@/features/kb/repository";
import { archiveNoteAction, unarchiveNoteAction, trashNoteAction } from "@/features/kb/actions";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import { renderMarkdown } from "@/lib/markdown/render";

export const dynamic = "force-dynamic";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();
  const [html, backlinks] = await Promise.all([renderMarkdown(note.markdown), getBacklinks(slug)]);

  return (
    <>
      <PageHeader
        title={note.title}
        eyebrow={note.archivedAt ? "archived" : note.status}
        description={
          note.shortSummary || "Layered summaries and reconstruction cues live with the note."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={`/kb/${note.slug}/export`}>
                <Download className="size-4" aria-hidden />
                Export
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/kb/${note.slug}/edit`}>
                <Pencil className="size-4" aria-hidden />
                Edit
              </Link>
            </Button>
            <ArchiveButton
              isArchived={!!note.archivedAt}
              onArchive={() => archiveNoteAction(note.id)}
              onUnarchive={() => unarchiveNoteAction(note.id)}
            />
            <TrashButton onTrash={() => trashNoteAction(note.id)} />
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <article
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <aside className="grid content-start gap-4">
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold">Recall scores</h2>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>Confidence: {note.confidenceScore.toFixed(2)}</div>
              <div>Mastery: {note.masteryScore.toFixed(2)}</div>
              <div>Forgetting: {note.forgettingScore.toFixed(2)}</div>
            </div>
          </section>
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold">Backlinks</h2>
            <div className="grid gap-2">
              {backlinks.length ? (
                backlinks.map((link) => (
                  <Link
                    key={link.source.id}
                    href={`/kb/${link.source.slug}`}
                    className="text-sm text-primary"
                  >
                    {link.source.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No backlinks yet.</p>
              )}
            </div>
          </section>
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold">Linked concepts</h2>
            <div className="flex flex-wrap gap-2">
              {note.linkedConcepts.map((concept) => (
                <Badge key={concept}>{concept}</Badge>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
