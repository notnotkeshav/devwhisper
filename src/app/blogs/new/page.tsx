import { PageHeader } from "@/components/page/page-header";
import { requireUser } from "@/lib/auth/session";
import { BlogForm } from "@/features/blogs/blog-form";
import { listBoards } from "@/features/board/repository";
import { getInternalLinks } from "@/lib/links/internal-links";
import { listTopics } from "@/features/topics/repository";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const user = await requireUser();
  const [boards, internalLinks, topics] = await Promise.all([
    listBoards(user.id),
    getInternalLinks(user.id),
    listTopics(user.id)
  ]);
  return (
    <>
      <PageHeader
        title="New blog"
        description="Write a durable learning output from a stabilized concept."
      />
      <BlogForm boards={boards} internalLinks={internalLinks} topics={topics} />
    </>
  );
}
