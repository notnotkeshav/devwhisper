import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { listBlogs, listArchivedBlogs, listTrashedBlogs } from "@/features/blogs/repository";

import {
  restoreBlogAction,
  permanentDeleteBlogAction,
  unarchiveBlogAction
} from "@/features/blogs/actions";
import { BinControls, ArchiveButton } from "@/features/shared/item-controls";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

export default async function BlogsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listBlogs(user.id),
    listArchivedBlogs(user.id),
    listTrashedBlogs(user.id)
  ]);

  const blogs = view === "archive" ? archived : view === "bin" ? trashed : active;

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Publishable learning outputs with wiki-links, board embeds, and reading time."
        actions={
          <Button asChild>
            <Link href="/blogs/new">
              <Plus className="size-4" aria-hidden />
              New blog
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={`/blogs/${blog.slug}`} className="flex-1">
                    <h2 className="text-sm font-semibold leading-snug hover:text-primary">
                      {blog.title}
                    </h2>
                  </Link>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                      blog.isPublic
                        ? "bg-blue-400/10 text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {blog.isPublic ? "Public" : "Draft"}
                  </span>
                </div>
                {blog.excerpt && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">{blog.excerpt}</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {blog.readingTimeMinutes}m read{blog.series ? ` · ${blog.series}` : ""}
                </span>
                {view === "bin" ? (
                  <BinControls
                    onRestore={restoreBlogAction.bind(null, blog.id)}
                    onPermanentDelete={permanentDeleteBlogAction.bind(null, blog.id)}
                  />
                ) : view === "archive" ? (
                  <ArchiveButton isArchived onUnarchive={unarchiveBlogAction.bind(null, blog.id)} />
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
