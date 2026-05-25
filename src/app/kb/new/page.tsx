import { PageHeader } from "@/components/page/page-header";
import { NoteForm } from "@/features/kb/note-form";

export default function NewNotePage() {
  return (
    <>
      <PageHeader
        title="Quick capture"
        description="Store markdown as source of truth and use [[wiki links]] for graph edges."
      />
      <NoteForm />
    </>
  );
}
