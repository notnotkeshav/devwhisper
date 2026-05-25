"use client";

import { useTransition } from "react";
import { Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { togglePublishAction } from "./actions";

export function PublishButton({ blogId, isPublic }: { blogId: string; isPublic: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={isPublic ? "secondary" : "default"}
      disabled={pending}
      onClick={() => startTransition(() => togglePublishAction(blogId))}
    >
      {isPublic ? (
        <>
          <Lock className="size-4" aria-hidden />
          {pending ? "Updating…" : "Unpublish"}
        </>
      ) : (
        <>
          <Globe className="size-4" aria-hidden />
          {pending ? "Publishing…" : "Publish"}
        </>
      )}
    </Button>
  );
}
