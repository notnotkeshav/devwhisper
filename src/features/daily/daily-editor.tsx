"use client";

import { useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveDailyNoteAction } from "./actions";

export function DailyEditor({ date, initialMarkdown }: { date: string; initialMarkdown: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => saveDailyNoteAction(fd))}
      className="grid gap-4 xl:grid-cols-[1fr_280px]"
    >
      <input type="hidden" name="day" value={date} />
      <div className="grid gap-3">
        <Textarea
          name="markdown"
          defaultValue={initialMarkdown}
          className="min-h-[520px] font-mono text-sm"
          placeholder={"- Learned\n- Blockers\n- Ideas\n- Linked: [[concept]]"}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" aria-hidden />
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      <aside className="grid content-start gap-3 text-sm text-muted-foreground">
        <div className="rounded-lg border p-4">
          <p className="mb-1 font-medium text-foreground">Tips</p>
          <ul className="grid gap-1">
            <li>
              Use <code className="text-xs">[[concept]]</code> to link to KB notes.
            </li>
            <li>
              Start lines with <code className="text-xs">- Learned:</code>,{" "}
              <code className="text-xs">- Blocker:</code>, <code className="text-xs">- Idea:</code>.
            </li>
            <li>Entry is keyed by ISO date — one note per day.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
