import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBlogs } from "@/features/blogs/repository";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await listBlogs();
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
      {blogs.length ? (
        <div className="grid gap-2">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.slug}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{blog.title}</h2>
                <Badge>{blog.isPublic ? "public" : "draft"}</Badge>
              </div>
              {blog.excerpt && <p className="mt-2 text-sm text-muted-foreground">{blog.excerpt}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No blogs yet"
          body="Publish durable learning outputs from KB notes when a concept stabilizes."
        />
      )}
    </>
  );
}
