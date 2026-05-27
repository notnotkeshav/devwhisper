import { PageHeader } from "@/components/page/page-header";
import { getDailyNote } from "@/features/daily/repository";
import { DailyEditor } from "@/features/daily/daily-editor";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";
import { requireUser } from "@/lib/auth/session";
import { listNotes } from "@/features/kb/repository";
import { listBlogs } from "@/features/blogs/repository";
import { listTopics } from "@/features/topics/repository";
import type { InternalLink } from "@/features/blogs/blog-editor";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default async function DailyDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const user = await requireUser();

  const [note, notes, blogs, topics] = await Promise.all([
    getDailyNote(date),
    listNotes(user.id, 100),
    listBlogs(user.id),
    listTopics(user.id)
  ]);

  const markdown = note?.markdown ?? "";
  const hrefs = await resolveWikiLinks(markdown);
  const html = markdown ? await renderMarkdown(markdown, hrefs) : "";

  const internalLinks: InternalLink[] = [
    ...notes.map((n) => ({ label: n.title, href: `/kb/${n.slug}`, type: "note" as const })),
    ...blogs.map((b) => ({ label: b.title, href: `/blogs/${b.slug}`, type: "blog" as const })),
    ...topics.map((t) => ({ label: t.title, href: `/topics/${t.slug}`, type: "topic" as const }))
  ];

  return (
    <>
      <PageHeader
        title={formatDate(date)}
        description="Your learning log for the day — capture blockers, insights, and ideas."
      />
      <DailyEditor
        date={date}
        initialMarkdown={markdown}
        initialHtml={html}
        internalLinks={internalLinks}
      />
    </>
  );
}
