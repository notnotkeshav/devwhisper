import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil, Pin, PinOff } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBacklinks, getNoteBySlug, getOutgoingLinks } from "@/features/kb/repository";
import {
  archiveNoteAction,
  unarchiveNoteAction,
  trashNoteAction,
  togglePinNoteAction
} from "@/features/kb/actions";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { extractMarkdownLinks } from "@/lib/markdown/wiki-links";
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
  const mdLinks = extractMarkdownLinks(note.markdown);
  const internalMdLinks = mdLinks.filter((l) => !l.isExternal);
  const externalLinks = mdLinks.filter((l) => l.isExternal);
  const html = await renderMarkdown(note.markdown, hrefs);

  return (
    <>
      <PageHeader
        title={note.title}
        eyebrow={
          note.archivedAt ? "Archived" : note.status.charAt(0).toUpperCase() + note.status.slice(1)
        }
        description={
          note.shortSummary || "Layered summaries and reconstruction cues live with the note."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <form action={togglePinNoteAction.bind(null, note.id, !!note.pinned)}>
              <Button
                type="submit"
                variant="secondary"
                title={note.pinned ? "Unpin from dashboard" : "Pin to dashboard"}
              >
                {note.pinned ? (
                  <PinOff className="size-4" aria-hidden />
                ) : (
                  <Pin className="size-4" aria-hidden />
                )}
                {note.pinned ? "Unpin" : "Pin"}
              </Button>
            </form>
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
            <h2
              className="mb-1 text-sm font-semibold"
              title="Other notes that reference this note using [[wiki links]] — the reverse of outgoing links"
            >
              Backlinks
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Notes that link <em>to</em> this one via <code>[[wiki links]]</code>
            </p>
            <div className="grid gap-2">
              {backlinks.length ? (
                backlinks.map((link) => (
                  <Link
                    key={link.source.id}
                    href={`/kb/${link.source.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    ← {link.source.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes link here yet. Add <code>[[{note.slug}]]</code> in another note.
                </p>
              )}
            </div>
          </section>
          <section className="rounded-lg border p-4">
            <h2
              className="mb-1 text-sm font-semibold"
              title="All links from this note — internal wiki links and external URLs"
            >
              Outgoing links
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Internal wiki links and external URLs referenced in this note
            </p>
            {outgoingLinks.length === 0 &&
            internalMdLinks.length === 0 &&
            externalLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No links yet.</p>
            ) : (
              <div className="grid gap-3">
                {(outgoingLinks.length > 0 || internalMdLinks.length > 0) && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Internal</p>
                    <div className="flex flex-wrap gap-2">
                      {outgoingLinks.map((link) => (
                        <Link
                          key={link.targetSlug}
                          href={(hrefs.get(link.targetSlug) ?? `/kb/${link.targetSlug}`) as never}
                        >
                          <Badge>{link.label}</Badge>
                        </Link>
                      ))}
                      {internalMdLinks.map((link) => (
                        <Link key={link.href} href={link.href as never}>
                          <Badge className="border">{link.label}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {externalLinks.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">External</p>
                    <div className="grid gap-1.5">
                      {externalLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-primary hover:underline"
                          title={link.href}
                        >
                          ↗ {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
