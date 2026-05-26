import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listDailyNotes } from "@/features/daily/repository";
import { TodayLink } from "@/features/daily/today-link";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const days = await listDailyNotes();
  return (
    <>
      <PageHeader
        title="Daily Notes"
        description="Obsidian-like learning logs, blockers, insights, and timeline anchors."
        actions={<TodayLink />}
      />
      {days.length ? (
        <div className="grid gap-2">
          {days.map((day) => (
            <Link
              key={day.id}
              href={`/daily/${day.day}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <h2 className="text-sm font-semibold">{day.day}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{day.markdown}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No daily notes"
          body="Open today to start a timeline of learning logs and blockers."
        />
      )}
    </>
  );
}
