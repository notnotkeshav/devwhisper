import "server-only";

import { listNotes } from "@/features/kb/repository";
import { listBlogs } from "@/features/blogs/repository";
import { listTopics } from "@/features/topics/repository";
import type { InternalLink } from "@/features/blogs/blog-editor";

export async function getInternalLinks(userId: string): Promise<InternalLink[]> {
  const [notes, blogs, topics] = await Promise.all([
    listNotes(userId, 200),
    listBlogs(userId),
    listTopics(userId)
  ]);
  return [
    ...notes.map((n) => ({ label: n.title, href: `/kb/${n.slug}`, type: "note" as const })),
    ...blogs.map((b) => ({ label: b.title, href: `/blogs/${b.slug}`, type: "blog" as const })),
    ...topics.map((t) => ({ label: t.title, href: `/topics/${t.slug}`, type: "topic" as const }))
  ];
}
