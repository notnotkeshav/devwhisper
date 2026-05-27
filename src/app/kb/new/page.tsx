import { PageHeader } from "@/components/page/page-header";
import { NoteForm } from "@/features/kb/note-form";
import { requireUser } from "@/lib/auth/session";
import { getInternalLinks } from "@/lib/links/internal-links";
import { listTopics } from "@/features/topics/repository";

export const dynamic = "force-dynamic";

export default async function NewNotePage() {
  const user = await requireUser();
  const [internalLinks, topics] = await Promise.all([
    getInternalLinks(user.id),
    listTopics(user.id)
  ]);
  return (
    <>
      <PageHeader
        title="New note"
        description="Write in markdown. Use [[wiki links]] to connect ideas — they become graph edges and backlinks automatically."
      />
      <NoteForm internalLinks={internalLinks} topics={topics} />
    </>
  );
}
