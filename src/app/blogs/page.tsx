import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBlogs, listArchivedBlogs, listTrashedBlogs } from "@/features/blogs/repository";
import {
  restoreBlogAction,
  permanentDeleteBlogAction,
  unarchiveBlogAction
} from "@/features/blogs/actions";
import { BinControls, ArchiveButton } from "@/features/shared/item-controls";

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

export default async function BlogsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listBlogs(),
    listArchivedBlogs(),
    listTrashedBlogs()
  ]);

  const blogs = view === "archive" ? archived : view === "bin" ? trashed : active;

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Publishable MDX learning outputs with SEO, series, and KB backlinks."
        actions={
          <Button asChild>
            <Link href="/blogs/new">
              <Plus className="size-4" aria-hidden />
              New blog
            </Link>
          </Button>
        }
      />

      {/* View tabs */}
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
            href={tab.id === "active" ? "/blogs" : `/blogs?view=${tab.id}`}
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

      {blogs.length ? (
        <div className="grid gap-2">
          {blogs.map((blog) => (
            <div key={blog.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/blogs/${blog.slug}`} className="flex-1 hover:underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">{blog.title}</h2>
                    <Badge>{blog.isPublic ? "public" : "draft"}</Badge>
                    {blog.archivedAt && <Badge>archived</Badge>}
                  </div>
                  {blog.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground">{blog.excerpt}</p>
                  )}
                </Link>
                {view === "bin" ? (
                  <BinControls
                    onRestore={() => restoreBlogAction(blog.id)}
                    onPermanentDelete={() => permanentDeleteBlogAction(blog.id)}
                  />
                ) : view === "archive" ? (
                  <ArchiveButton
                    isArchived
                    onArchive={async () => {}}
                    onUnarchive={() => unarchiveBlogAction(blog.id)}
                  />
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
                ? "No archived blogs"
                : "No blogs yet"
          }
          body={
            view === "active"
              ? "Publish durable learning outputs from KB notes when a concept stabilizes."
              : view === "archive"
                ? "Archived blogs are hidden from the main list but not deleted."
                : "Deleted blogs appear here. Restore or permanently delete them."
          }
        />
      )}
    </>
  );
}
