import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getBlogBySlug } from "@/features/blogs/repository";
import { BlogForm } from "@/features/blogs/blog-form";
import { requireUser } from "@/lib/auth/session";
import { listBoards } from "@/features/board/repository";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;
  const [blog, boards] = await Promise.all([getBlogBySlug(slug), listBoards()]);
  if (!blog) notFound();
  return (
    <>
      <PageHeader title={`Edit: ${blog.title}`} description="Update content, excerpt, or series." />
      <BlogForm blog={blog} boards={boards} />
    </>
  );
}
