import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { getBlogBySlugPublic } from "@/features/blogs/repository";
import { getBacklinks } from "@/features/kb/repository";
import { PublishButton } from "@/features/blogs/publish-button";
import { archiveBlogAction, unarchiveBlogAction, trashBlogAction } from "@/features/blogs/actions";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  const { slug } = await params;
  const blog = await getBlogBySlugPublic(slug);

  if (!blog) notFound();

  const isOwner = session?.user.id === blog.userId;

  // draft/archived blogs are only visible to the owner
  if ((!blog.isPublic || blog.archivedAt) && !isOwner) notFound();

  const [hrefs, backlinks] = await Promise.all([resolveWikiLinks(blog.mdx), getBacklinks(slug)]);
  const html = await renderMarkdown(blog.mdx, hrefs);
  return (
    <>
      <PageHeader
        title={blog.title}
        eyebrow={blog.archivedAt ? "archived" : blog.isPublic ? "public" : "draft"}
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
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <article
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {backlinks.length > 0 && (
          <aside className="grid content-start gap-4">
            <section className="rounded-lg border p-4">
              <h2 className="mb-3 text-sm font-semibold">Backlinks</h2>
              <div className="grid gap-2">
                {backlinks.map((link) => (
                  <Link
                    key={link.source.id}
                    href={`/kb/${link.source.slug}` as never}
                    className="text-sm text-primary"
                  >
                    {link.source.title}
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        )}
      </div>
    </>
  );
}
