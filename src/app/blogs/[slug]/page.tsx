import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBlogBySlugPublic } from "@/features/blogs/repository";
import { getBacklinks } from "@/features/kb/repository";
import { PublishButton } from "@/features/blogs/publish-button";
import { archiveBlogAction, unarchiveBlogAction, trashBlogAction } from "@/features/blogs/actions";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { extractMarkdownLinks, extractWikiLinks } from "@/lib/markdown/wiki-links";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  const { slug } = await params;
  const blog = await getBlogBySlugPublic(slug);

  if (!blog) notFound();

  const isOwner = session?.user.id === blog.userId;
  if ((!blog.isPublic || blog.archivedAt) && !isOwner) notFound();

  const [hrefs, backlinks] = await Promise.all([resolveWikiLinks(blog.mdx), getBacklinks(slug)]);
  const html = await renderMarkdown(blog.mdx, hrefs);

  const wikiLinks = extractWikiLinks(blog.mdx);
  const mdLinks = extractMarkdownLinks(blog.mdx);
  const internalMdLinks = mdLinks.filter((l) => !l.isExternal);
  const externalLinks = mdLinks.filter((l) => l.isExternal);

  const hasOutgoing =
    wikiLinks.length > 0 || internalMdLinks.length > 0 || externalLinks.length > 0;
  const hasAside = backlinks.length > 0 || hasOutgoing;

  return (
    <>
      <PageHeader
        title={blog.title}
        eyebrow={blog.archivedAt ? "Archived" : blog.isPublic ? "Public · Blog" : "Draft · Blog"}
        description={`${blog.readingTimeMinutes} min read${blog.series ? ` · ${blog.series}` : ""}`}
        actions={
          isOwner ? (
            <div className="flex flex-wrap gap-2">
              <PublishButton blogId={blog.id} isPublic={blog.isPublic} />
              <Button variant="secondary" asChild>
                <Link href={`/blogs/${slug}/edit`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Link>
              </Button>
              <ArchiveButton
                isArchived={!!blog.archivedAt}
                onArchive={archiveBlogAction.bind(null, blog.id)}
                onUnarchive={unarchiveBlogAction.bind(null, blog.id)}
              />
              <TrashButton onTrash={trashBlogAction.bind(null, blog.id)} />
            </div>
          ) : undefined
        }
      />
      <div className={`grid gap-6 ${hasAside ? "xl:grid-cols-[1fr_280px]" : ""}`}>
        <article
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {hasAside && (
          <aside className="grid content-start gap-4">
            {/* Backlinks */}
            {backlinks.length > 0 && (
              <section className="rounded-lg border p-4">
                <h2 className="mb-1 text-sm font-semibold">Backlinks</h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  Notes that link <em>to</em> this blog
                </p>
                <div className="grid gap-2">
                  {backlinks.map((link) => (
                    <Link
                      key={link.source.id}
                      href={`/kb/${link.source.slug}` as never}
                      className="text-sm text-primary hover:underline"
                    >
                      ← {link.source.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Outgoing links */}
            {hasOutgoing && (
              <section className="rounded-lg border p-4">
                <h2 className="mb-1 text-sm font-semibold">Outgoing links</h2>
                <p className="mb-3 text-xs text-muted-foreground">
                  Internal and external links referenced in this blog
                </p>
                <div className="grid gap-3">
                  {(wikiLinks.length > 0 || internalMdLinks.length > 0) && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Internal</p>
                      <div className="flex flex-wrap gap-2">
                        {wikiLinks.map((wl) => {
                          const href = hrefs.get(wl.slug) ?? `/kb/${wl.slug}`;
                          return (
                            <Link key={wl.slug} href={href as never}>
                              <Badge>{wl.alias ?? wl.label}</Badge>
                            </Link>
                          );
                        })}
                        {internalMdLinks.map((l) => (
                          <Link key={l.href} href={l.href as never}>
                            <Badge className="border">{l.label}</Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {externalLinks.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">External</p>
                      <div className="grid gap-1.5">
                        {externalLinks.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm text-primary hover:underline"
                            title={l.href}
                          >
                            ↗ {l.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
