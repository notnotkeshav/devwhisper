import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getBlogBySlug } from "@/features/blogs/repository";
import { BlogForm } from "@/features/blogs/blog-form";
import { requireUser } from "@/lib/auth/session";
import { listBoards } from "@/features/board/repository";
import { getInternalLinks } from "@/lib/links/internal-links";
import { listTopics } from "@/features/topics/repository";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const [blog, boards, internalLinks, topics] = await Promise.all([
    getBlogBySlug(slug, user.id),
    listBoards(user.id),
    getInternalLinks(user.id),
    listTopics(user.id)
  ]);
  if (!blog) notFound();
  return (
    <>
      <PageHeader
        title={`Edit — ${blog.title}`}
        description="Update content, excerpt, or series."
      />
      <BlogForm blog={blog} boards={boards} internalLinks={internalLinks} topics={topics} />
    </>
  );
}
