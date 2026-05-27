"use client";

import { useTransition, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import type { Note } from "@/lib/db/schema";
import { saveNoteAction } from "./actions";
import { BlogEditor, type InternalLink } from "@/features/blogs/blog-editor";

const statuses = [
  { value: "seed", label: "Seed" },
  { value: "growing", label: "Growing" },
  { value: "evergreen", label: "Evergreen" },
  { value: "archived", label: "Archived" }
] as const;

type TopicOption = { id: string; title: string };

export function NoteForm({
  note,
  internalLinks = [],
  topics = []
}: {
  note?: Note | null;
  internalLinks?: InternalLink[];
  topics?: TopicOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [markdown, setMarkdown] = useState(note?.markdown ?? "");

  function handleSubmit(fd: FormData) {
    fd.set("markdown", markdown);
    startTransition(() => saveNoteAction(fd));
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      {/* Meta row */}
      <div className="grid gap-3 md:grid-cols-[1fr_200px_160px]">
        <Input name="title" defaultValue={note?.title} required placeholder="Title" />
        <Input
          name="slug"
          defaultValue={note?.slug}
          placeholder="slug (auto-generated)"
          readOnly={!!note}
          className={note ? "cursor-not-allowed opacity-60" : ""}
          title={note ? "Slug is locked after first save" : undefined}
        />
        <Select name="status" defaultValue={note?.status ?? "seed"} placeholder="Status">
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {topics.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Topic
          </label>
          <Select
            name="topicId"
            defaultValue={note?.topicId ?? "__none__"}
            placeholder="No topic"
            className="w-56"
          >
            <SelectItem value="__none__">No topic</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Main area: editor left, summaries right */}
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">
            Main content — use <code>[[wiki links]]</code> to create graph edges.
          </p>
          <BlogEditor
            initialContent={markdown}
            onChange={setMarkdown}
            internalLinks={internalLinks}
          />
        </div>

        <aside className="grid content-start gap-3">
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground">30-second summary</label>
            <Textarea
              name="shortSummary"
              defaultValue={note?.shortSummary}
              placeholder="One paragraph — the fastest recall cue."
              className="min-h-20 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground">Layer 2 summary</label>
            <Textarea
              name="mediumSummary"
              defaultValue={note?.mediumSummary}
              placeholder="Key mechanics, trade-offs, examples."
              className="min-h-24 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground">Deep reconstruction</label>
            <Textarea
              name="deepSummary"
              defaultValue={note?.deepSummary}
              placeholder="Edge cases, mental models, failure modes."
              className="min-h-28 text-sm"
            />
          </div>
        </aside>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}
