import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listTopics } from "@/features/topics/repository";
import { NewTopicButton } from "@/features/topics/new-topic-button";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await listTopics();
  return (
    <>
      <PageHeader
        title="Topics"
        description="Aggregate notes, blogs, boards, flashcards, resources, and timelines."
        actions={<NewTopicButton />}
      />
      {topics.length ? (
        <div className="grid gap-2">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <h2 className="text-sm font-semibold">{topic.title}</h2>
              {topic.description && (
                <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No topics"
          body="Topics become learning hubs for concepts like websockets and PostgreSQL."
        />
      )}
    </>
  );
}
