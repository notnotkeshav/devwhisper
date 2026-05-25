import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getTopicBySlug } from "@/features/topics/repository";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();
  return (
    <>
      <PageHeader title={topic.title} description={topic.description || "Topic learning hub."} />
      <div className="grid gap-4 md:grid-cols-3">
        {["Notes", "Blogs", "Boards", "Flashcards", "Resources", "Timeline"].map((item) => (
          <section key={item} className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">{item}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Linked {item.toLowerCase()} appear here.
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
