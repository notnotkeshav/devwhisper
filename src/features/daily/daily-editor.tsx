"use client";

import { useTransition, useState } from "react";
import { Save, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDailyNoteAction } from "./actions";
import { BlogEditor } from "@/features/blogs/blog-editor";

export function DailyEditor({
  date,
  initialMarkdown,
  initialHtml
}: {
  date: string;
  initialMarkdown: string;
  initialHtml: string;
}) {
  const [pending, startTransition] = useTransition();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [tab, setTab] = useState<"edit" | "preview">(initialHtml ? "preview" : "edit");

  function handleSubmit(fd: FormData) {
    fd.set("markdown", markdown);
    startTransition(() => saveDailyNoteAction(fd));
  }

  return (
    <form action={handleSubmit} className="grid gap-4 xl:grid-cols-[1fr_260px]">
      <input type="hidden" name="day" value={date} />

      <div className="grid gap-3">
        <div className="flex items-center gap-1 border-b pb-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "edit" ? "default" : "ghost"}
            onClick={() => setTab("edit")}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "preview" ? "default" : "ghost"}
            onClick={() => setTab("preview")}
          >
            <Eye className="size-3.5" aria-hidden />
            Preview
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {tab === "preview" ? "Showing last saved version" : ""}
          </span>
        </div>

        {tab === "edit" ? (
          <BlogEditor initialContent={markdown} onChange={setMarkdown} />
        ) : (
          <div>
            {initialHtml ? (
              <article
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: initialHtml }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing saved yet. Write something and save to see the preview.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" aria-hidden />
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <aside className="grid content-start gap-3 text-sm text-muted-foreground">
        <div className="rounded-lg border p-4">
          <p className="mb-2 font-medium text-foreground">Tips</p>
          <ul className="grid gap-1.5 text-xs">
            <li>
              Use <code className="rounded bg-muted px-1">[[concept]]</code> to link to KB notes —
              creates graph edges automatically.
            </li>
            <li>Use headings to section your day: Learned, Blockers, Ideas, Insights.</li>
            <li>Use task lists to track action items.</li>
            <li>One note per day, keyed by date.</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <p className="mb-2 font-medium text-foreground">Keyboard shortcuts</p>
          <ul className="grid gap-1 text-xs">
            <li>
              <kbd className="rounded bg-muted px-1">Ctrl+B</kbd> Bold
            </li>
            <li>
              <kbd className="rounded bg-muted px-1">Ctrl+I</kbd> Italic
            </li>
            <li>
              <kbd className="rounded bg-muted px-1">Ctrl+`</kbd> Inline code
            </li>
            <li>
              <kbd className="rounded bg-muted px-1">Tab</kbd> Indent list item
            </li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
