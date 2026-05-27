import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listDailyNotes } from "@/features/daily/repository";
import { TodayLink } from "@/features/daily/today-link";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  return {
    display: date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  };
}

/** Strip markdown syntax to plain text for preview */
function toPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default async function DailyPage() {
  const days = await listDailyNotes();
  return (
    <>
      <PageHeader
        title="Daily logs"
        description="One entry per day — capture what you learned, blockers you hit, and ideas that surfaced."
        actions={<TodayLink />}
      />
      {days.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => {
            const { display } = formatDate(day.day);
            const preview = toPlainText(day.markdown);
            return (
              <Link
                key={day.id}
                href={`/daily/${day.day}`}
                className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <h2 className="mb-2 text-sm font-semibold leading-snug">{display}</h2>
                {preview ? (
                  <p className="line-clamp-3 text-xs text-muted-foreground">{preview}</p>
                ) : (
                  <p className="text-xs italic text-muted-foreground">Empty log</p>
                )}
                <span className="mt-3 text-xs text-primary">{"View log →"}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No daily logs yet"
          body="Open today's log to start capturing your learning timeline."
        />
      )}
    </>
  );
}
