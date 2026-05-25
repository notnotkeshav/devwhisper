import { PageHeader } from "@/components/page/page-header";
import { getRevisionQueue } from "@/features/kb/repository";
import { RevisionPanel } from "@/features/revise/revision-panel";

export const dynamic = "force-dynamic";

export default async function RevisePage() {
  const notes = await getRevisionQueue();
  return (
    <>
      <PageHeader
        title="Revise"
        description="Quick, deep, interview, architecture, and flash recall modes for progressive reconstruction."
      />
      <RevisionPanel notes={notes} />
    </>
  );
}
