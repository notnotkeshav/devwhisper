"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchiveButtonProps {
  isArchived: boolean;
  onArchive?: () => Promise<void>;
  onUnarchive?: () => Promise<void>;
}

export function ArchiveButton({ isArchived, onArchive, onUnarchive }: ArchiveButtonProps) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (isArchived && onUnarchive) startTransition(onUnarchive);
        if (!isArchived && onArchive) startTransition(onArchive);
      }}
    >
      {isArchived ? (
        <>
          <ArchiveRestore className="size-4" aria-hidden />
          Unarchive
        </>
      ) : (
        <>
          <Archive className="size-4" aria-hidden />
          Archive
        </>
      )}
    </Button>
  );
}

interface TrashButtonProps {
  onTrash: () => Promise<void>;
}

export function TrashButton({ onTrash }: TrashButtonProps) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm("Move to bin? You can restore it later.")) {
          startTransition(onTrash);
        }
      }}
    >
      <Trash2 className="size-4" aria-hidden />
      {pending ? "Moving…" : "Move to bin"}
    </Button>
  );
}

interface BinControlsProps {
  onRestore: () => Promise<void>;
  onPermanentDelete: () => Promise<void>;
}

export function BinControls({ onRestore, onPermanentDelete }: BinControlsProps) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(onRestore)}
      >
        <RotateCcw className="size-4" aria-hidden />
        Restore
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (confirm("Permanently delete? This cannot be undone.")) {
            startTransition(onPermanentDelete);
          }
        }}
      >
        <X className="size-4" aria-hidden />
        Delete forever
      </Button>
    </div>
  );
}
