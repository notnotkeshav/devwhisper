import { PageHeader } from "@/components/page/page-header";
import { getDailyNote } from "@/features/daily/repository";
import { DailyEditor } from "@/features/daily/daily-editor";
import { renderMarkdown } from "@/lib/markdown/render";
import { resolveWikiLinks } from "@/lib/markdown/resolve-wiki-links";

export const dynamic = "force-dynamic";

export default async function DailyDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const note = await getDailyNote(date);
  const markdown = note?.markdown ?? "";
  const hrefs = await resolveWikiLinks(markdown);
  const html = markdown ? await renderMarkdown(markdown, hrefs) : "";
  return (
    <>
      <PageHeader
        title={date}
        description="Capture learning logs, blockers, insights, ideas, and linked concepts."
      />
      <DailyEditor date={date} initialMarkdown={markdown} initialHtml={html} />
    </>
  );
}
