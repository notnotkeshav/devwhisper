import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { getBlogBySlug } from "@/features/blogs/repository";
import { PublishButton } from "@/features/blogs/publish-button";
import { renderMarkdown } from "@/lib/markdown/render";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  const html = await renderMarkdown(blog.mdx);
  return (
    <>
      <PageHeader
        title={blog.title}
        eyebrow={blog.isPublic ? "public" : "draft"}
        description={`${blog.readingTimeMinutes} min read${blog.series ? ` · ${blog.series}` : ""}`}
        actions={
          <div className="flex gap-2">
            <PublishButton blogId={blog.id} isPublic={blog.isPublic} />
            <Button variant="secondary" asChild>
              <Link href={`/blogs/${slug}/edit`}>
                <Pencil className="size-4" aria-hidden />
                Edit
              </Link>
            </Button>
          </div>
        }
      />
      <article
        className="prose prose-invert max-w-3xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
