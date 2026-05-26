import { PageHeader } from "@/components/page/page-header";
import { getRevisionQueue } from "@/features/kb/repository";
import { RevisionPanel } from "@/features/revise/revision-panel";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function RevisePage() {
  const user = await requireUser();
  const notes = await getRevisionQueue(user.id);
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
