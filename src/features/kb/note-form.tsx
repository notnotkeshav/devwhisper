"use client";

import { useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/db/schema";
import { saveNoteAction } from "./actions";

const statuses = ["seed", "growing", "evergreen", "archived"] as const;

export function NoteForm({ note }: { note?: Note | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <form action={(fd) => startTransition(() => saveNoteAction(fd))} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-[1fr_200px_160px]">
        <Input name="title" defaultValue={note?.title} required placeholder="Title" />
        <Input name="slug" defaultValue={note?.slug} placeholder="slug (auto)" />
        <select
          name="status"
          defaultValue={note?.status ?? "seed"}
          className="h-9 rounded-md border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        name="shortSummary"
        defaultValue={note?.shortSummary}
        placeholder="30-second summary"
        className="min-h-20"
      />
      <Textarea
        name="mediumSummary"
        defaultValue={note?.mediumSummary}
        placeholder="Layer 2 summary"
        className="min-h-24"
      />
      <Textarea
        name="deepSummary"
        defaultValue={note?.deepSummary}
        placeholder="Deep reconstruction notes"
        className="min-h-28"
      />
      <Textarea
        name="markdown"
        defaultValue={note?.markdown}
        placeholder="Write portable markdown. Use [[wiki links]] for graph edges."
        className="min-h-[400px] font-mono text-sm"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}
