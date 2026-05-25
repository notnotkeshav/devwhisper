"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTopicAction } from "./actions";

export function NewTopicButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden />
          New topic
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/3 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border bg-card p-6 shadow-2xl">
          <Dialog.Title className="mb-4 text-base font-semibold">New topic</Dialog.Title>
          <VisuallyHidden>
            <Dialog.Description>
              Create a new topic to group related notes, blogs, and resources.
            </Dialog.Description>
          </VisuallyHidden>
          <form
            action={(fd) => startTransition(() => createTopicAction(fd))}
            className="grid gap-3"
          >
            <Input name="title" placeholder="Topic title" required autoFocus />
            <Textarea
              name="description"
              placeholder="Short description (optional)"
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create topic"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
