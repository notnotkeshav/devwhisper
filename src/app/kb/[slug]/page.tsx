import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBacklinks, getNoteBySlug, getOutgoingLinks } from "@/features/kb/repository";
import { archiveNoteAction, unarchiveNoteAction, trashNoteAction } from "@/features/kb/actions";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const note = await getNoteBySlug(slug, user.id);
  if (!note) notFound();
  const [hrefs, backlinks, outgoingLinks] = await Promise.all([
    resolveWikiLinks(note.markdown),
    getBacklinks(slug),
    getOutgoingLinks(note.id)
  ]);
  const html = await renderMarkdown(note.markdown, hrefs);

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
              onArchive={archiveNoteAction.bind(null, note.id)}
              onUnarchive={unarchiveNoteAction.bind(null, note.id)}
            />
            <TrashButton onTrash={trashNoteAction.bind(null, note.id)} />
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
            <div className="grid gap-3 text-sm">
              {(
                [
                  {
                    label: "Confidence",
                    value: note.confidenceScore,
                    color: "bg-emerald-500",
                    tip: "How well you self-reported knowing this after reviews"
                  },
                  {
                    label: "Mastery",
                    value: note.masteryScore,
                    color: "bg-blue-500",
                    tip: "Long-term weighted average of past confidence scores"
                  },
                  {
                    label: "Forgetting",
                    value: note.forgettingScore,
                    color: "bg-amber-500",
                    tip: "Decays over time — rises when overdue, falls after review"
                  }
                ] as const
              ).map(({ label, value, color, tip }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground" title={tip}>
                      {label}
                    </span>
                    <span className="tabular-nums text-foreground">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${Math.min(100, value * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Revision #{note.revisionCount} · next in {note.revisionIntervalDays}d
              </p>
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
              {outgoingLinks.length ? (
                outgoingLinks.map((link) => (
                  <Link
                    key={link.targetSlug}
                    href={(hrefs.get(link.targetSlug) ?? `/kb/${link.targetSlug}`) as never}
                  >
                    <Badge>{link.label}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No outgoing links yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
