import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getNoteBySlug } from "@/features/kb/repository";
import { NoteForm } from "@/features/kb/note-form";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const note = await getNoteBySlug(slug, user.id);
  if (!note) notFound();
  return (
    <>
      <PageHeader
        title={`Edit ${note.title}`}
        description="Markdown remains portable; editor state is optional metadata."
      />
      <NoteForm note={note} />
    </>
  );
}
