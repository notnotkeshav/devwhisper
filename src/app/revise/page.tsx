import { Brain } from "lucide-react";
import { PageHeader } from "@/components/page/page-header";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function RevisePage() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Revise"
        description="Spaced-repetition revision sessions — review what you know, reinforce what you don't."
      />
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Brain className="size-8 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold">Coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Active recall sessions with confidence ratings, forgetting curves, and adaptive
            scheduling are being built. Your notes are already being scored — the UI to review them
            is on its way.
          </p>
        </div>
      </div>
    </>
  );
}
