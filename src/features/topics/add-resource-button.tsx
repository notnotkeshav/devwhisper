"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { createResourceAction } from "./actions";

const kinds = [
  { value: "link", label: "Link" },
  { value: "article", label: "Article" },
  { value: "book", label: "Book" },
  { value: "video", label: "Video" },
  { value: "doc", label: "Documentation" },
  { value: "other", label: "Other" }
] as const;

export function AddResourceButton({ topicId }: { topicId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      await createResourceAction(fd);
      setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="secondary">
          <Plus className="size-3.5" aria-hidden />
          Add resource
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/3 z-50 w-[min(500px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border bg-card p-6 shadow-2xl">
          <Dialog.Title className="mb-4 text-base font-semibold">Add resource</Dialog.Title>
          <VisuallyHidden>
            <Dialog.Description>
              Add a link, book, video, or article to this topic.
            </Dialog.Description>
          </VisuallyHidden>
          <form action={handleSubmit} className="grid gap-3">
            <input type="hidden" name="topicId" value={topicId} />
            <Input name="title" placeholder="Title" required autoFocus />
            <Input name="url" placeholder="URL (optional)" type="url" />
            <Select name="kind" defaultValue="link" placeholder="Type">
              {kinds.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </Select>
            <Textarea name="notes" placeholder="Notes (optional)" className="min-h-16 text-sm" />
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add resource"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
