import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getNoteBySlug } from "@/features/kb/repository";
import { NoteForm } from "@/features/kb/note-form";
import { requireUser } from "@/lib/auth/session";
import { getInternalLinks } from "@/lib/links/internal-links";
import { listTopics } from "@/features/topics/repository";

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const [note, internalLinks, topics] = await Promise.all([
    getNoteBySlug(slug, user.id),
    getInternalLinks(user.id),
    listTopics(user.id)
  ]);
  if (!note) notFound();
  return (
    <>
      <PageHeader
        title={`Edit — ${note.title}`}
        description="Markdown is the source of truth. Use [[wiki links]] to connect ideas."
      />
      <NoteForm note={note} internalLinks={internalLinks} topics={topics} />
    </>
  );
}
