import { PageHeader } from "@/components/page/page-header";
import { requireUser } from "@/lib/auth/session";
import { BlogForm } from "@/features/blogs/blog-form";
import { listBoards } from "@/features/board/repository";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  await requireUser();
  const boards = await listBoards();
  return (
    <>
      <PageHeader
        title="New blog"
        description="Write a durable learning output from a stabilized concept."
      />
      <BlogForm boards={boards} />
    </>
  );
}
