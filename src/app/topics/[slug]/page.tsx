import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ExternalLink, FileText, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { Badge } from "@/components/ui/badge";
import { getTopicBySlug, getTopicLinkedData } from "@/features/topics/repository";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  seed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  growing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  evergreen: "bg-green-500/15 text-green-400 border-green-500/30",
  archived: "bg-muted text-muted-foreground border-border"
};

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const topic = await getTopicBySlug(slug, user.id);
  if (!topic) notFound();

  const { notes, resources, flashcards } = await getTopicLinkedData(topic.id, user.id);

  return (
    <>
      <PageHeader title={topic.title} description={topic.description || "Topic learning hub."} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Notes */}
        <section className="grid content-start gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4 text-emerald-400" aria-hidden />
            Notes
            <span className="ml-auto text-xs text-muted-foreground">{notes.length}</span>
          </h2>
          {notes.length ? (
            <div className="grid gap-2">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/kb/${note.slug}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{note.title}</p>
                    {note.shortSummary && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {note.shortSummary}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor[note.status] ?? ""}`}
                  >
                    {note.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No notes yet. Create a note and set its topic to <strong>{topic.title}</strong>.
            </p>
          )}
        </section>

        <div className="grid content-start gap-4">
          {/* Flashcards */}
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FlaskConical className="size-4 text-blue-400" aria-hidden />
              Flashcards
              <span className="ml-auto text-xs text-muted-foreground">{flashcards.length}</span>
            </h2>
            {flashcards.length ? (
              <div className="grid gap-2">
                {flashcards.map((fc) => (
                  <div key={fc.id} className="rounded-md border p-2.5 text-xs">
                    <p className="font-medium text-foreground">{fc.question}</p>
                    <p className="mt-1 text-muted-foreground">{fc.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No flashcards yet.</p>
            )}
          </section>

          {/* Resources */}
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4 text-purple-400" aria-hidden />
              Resources
              <span className="ml-auto text-xs text-muted-foreground">{resources.length}</span>
            </h2>
            {resources.length ? (
              <div className="grid gap-2">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {r.title}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    ) : (
                      <span>{r.title}</span>
                    )}
                    <Badge className="ml-auto text-[10px]">{r.kind}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resources yet.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
