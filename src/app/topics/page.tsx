import Link from "next/link";
import { BookOpen, NotebookTabs } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listTopics } from "@/features/topics/repository";
import { NewTopicButton } from "@/features/topics/new-topic-button";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const user = await requireUser();
  const topics = await listTopics(user.id);
  return (
    <>
      <PageHeader
        title="Topics"
        description="Learning hubs that group notes, blogs, boards, and resources into one place."
        actions={<NewTopicButton />}
      />
      {topics.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-400/10">
                  <NotebookTabs className="size-4 text-purple-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">{topic.title}</h2>
                  {topic.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {topic.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="size-3" aria-hidden />
                <span>
                  {topic.noteCount} {topic.noteCount === 1 ? "note" : "notes"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No topics yet"
          body="Create a topic to organise related notes and resources — for example, TypeScript, PostgreSQL, or System Design."
        />
      )}
    </>
  );
}
