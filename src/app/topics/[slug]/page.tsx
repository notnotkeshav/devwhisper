import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ExternalLink, FileText, PenLine, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { getTopicBySlug, getTopicLinkedData } from "@/features/topics/repository";
import { AddResourceButton } from "@/features/topics/add-resource-button";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  seed: "Seed",
  growing: "Growing",
  evergreen: "Evergreen",
  archived: "Archived"
};

const statusColor: Record<string, string> = {
  seed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  growing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  evergreen: "bg-green-500/15 text-green-400 border-green-500/30",
  archived: "bg-muted text-muted-foreground border-border"
};

const kindColor: Record<string, string> = {
  link: "bg-blue-500/10 text-blue-400",
  article: "bg-emerald-500/10 text-emerald-400",
  book: "bg-amber-500/10 text-amber-400",
  video: "bg-red-500/10 text-red-400",
  doc: "bg-purple-500/10 text-purple-400",
  other: "bg-muted text-muted-foreground"
};

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const topic = await getTopicBySlug(slug, user.id);
  if (!topic) notFound();

  const { notes, blogs, resources } = await getTopicLinkedData(topic.id, user.id);

  return (
    <>
      <PageHeader
        title={topic.title}
        eyebrow="Topic"
        description={
          topic.description || "A learning hub grouping related notes, blogs, and resources."
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Notes */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4 text-emerald-400" aria-hidden />
            Notes
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {notes.length}
            </span>
          </h2>
          {notes.length ? (
            <div className="grid gap-2">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/kb/${note.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-md border p-2.5 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-primary">
                      {note.title}
                    </p>
                    {note.shortSummary && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {note.shortSummary}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${statusColor[note.status] ?? ""}`}
                  >
                    {statusLabel[note.status] ?? note.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No notes yet. Open a note and set its topic to <strong>{topic.title}</strong>.
            </p>
          )}
        </section>

        {/* Blogs */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <PenLine className="size-4 text-orange-400" aria-hidden />
            Blogs
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {blogs.length}
            </span>
          </h2>
          {blogs.length ? (
            <div className="grid gap-2">
              {blogs.map((b) => (
                <Link
                  key={b.id}
                  href={`/blogs/${b.slug}`}
                  className="group flex items-center gap-2 rounded-md border p-2.5 transition-colors hover:bg-muted"
                >
                  <PenLine className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm group-hover:text-primary">{b.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No blogs yet. Set this topic on a blog to see it here.
            </p>
          )}
        </section>

        {/* Resources */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-purple-400" aria-hidden />
            Resources
            <span className="ml-auto flex items-center gap-2">
              <span className="text-xs font-normal text-muted-foreground">{resources.length}</span>
              <AddResourceButton topicId={topic.id} />
            </span>
          </h2>
          {resources.length ? (
            <div className="grid gap-2">
              {resources.map((r) => (
                <div key={r.id} className="rounded-md border bg-muted/20 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{r.title}</p>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize ${kindColor[r.kind] ?? kindColor.other}`}
                    >
                      {r.kind}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="mb-1 text-xs text-muted-foreground line-clamp-2">{r.notes}</p>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                      title={r.url}
                    >
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                      <span className="truncate">{r.url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No resources yet. Add books, articles, videos, or links.
            </p>
          )}
        </section>

        {/* Flashcards */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-blue-400" aria-hidden />
            Flashcards
            <span className="ml-auto rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              Soon
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Spaced-repetition flashcards for this topic are coming soon.
          </p>
        </section>
      </div>
    </>
  );
}
