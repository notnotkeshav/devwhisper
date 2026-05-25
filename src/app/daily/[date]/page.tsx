import { PageHeader } from "@/components/page/page-header";
import { getDailyNote } from "@/features/daily/repository";
import { DailyEditor } from "@/features/daily/daily-editor";

export const dynamic = "force-dynamic";

export default async function DailyDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const note = await getDailyNote(date);
  return (
    <>
      <PageHeader
        title={date}
        description="Capture learning logs, blockers, insights, ideas, and linked concepts."
      />
      <DailyEditor date={date} initialMarkdown={note?.markdown ?? ""} />
    </>
  );
}
