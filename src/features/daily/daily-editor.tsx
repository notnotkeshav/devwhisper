"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { Save, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDailyNoteAction } from "./actions";
import { BlogEditor, type InternalLink } from "@/features/blogs/blog-editor";
import { extractWikiLinks, extractMarkdownLinks } from "@/lib/markdown/wiki-links";
import Link from "next/link";

export function DailyEditor({
  date,
  initialMarkdown,
  initialHtml,
  internalLinks = []
}: {
  date: string;
  initialMarkdown: string;
  initialHtml: string;
  internalLinks?: InternalLink[];
}) {
  const [pending, startTransition] = useTransition();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  // liveHtml tracks the editor's current rendered output — stays up to date as you type
  const [liveHtml, setLiveHtml] = useState(initialHtml);
  const [tab, setTab] = useState<"edit" | "preview">(initialHtml ? "preview" : "edit");
  const wasSubmitting = useRef(false);

  // Switch to preview after save completes
  useEffect(() => {
    if (pending) {
      wasSubmitting.current = true;
      return;
    }
    if (wasSubmitting.current) {
      wasSubmitting.current = false;
      const id = setTimeout(() => setTab("preview"), 0);
      return () => clearTimeout(id);
    }
  }, [pending]);

  const wikiLinks = extractWikiLinks(markdown);
  const mdLinks = extractMarkdownLinks(markdown);

  // Wiki-links resolved against internalLinks map
  const resolvedInternal = wikiLinks.map((wl) => {
    const match = internalLinks.find(
      (l) => l.label.toLowerCase() === wl.label.toLowerCase() || l.href.endsWith(`/${wl.slug}`)
    );
    return { label: wl.alias ?? wl.label, href: match?.href ?? `/kb/${wl.slug}` };
  });

  // Relative /path links from link-dialog (internal) and https:// links (external)
  const internalMdLinks = mdLinks.filter((l) => !l.isExternal);
  const externalLinks = mdLinks.filter((l) => l.isExternal);

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
          {tab === "preview" && (
            <span className="ml-auto text-xs text-muted-foreground">Live preview</span>
          )}
        </div>

        {tab === "edit" ? (
          <BlogEditor
            initialContent={markdown}
            onChange={setMarkdown}
            onHtmlChange={setLiveHtml}
            internalLinks={internalLinks}
          />
        ) : (
          <div>
            {liveHtml ? (
              <article
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: liveHtml }}
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
        {(resolvedInternal.length > 0 ||
          internalMdLinks.length > 0 ||
          externalLinks.length > 0) && (
          <div className="rounded-lg border p-4">
            <p className="mb-2 font-medium text-foreground">Outgoing links</p>
            {(resolvedInternal.length > 0 || internalMdLinks.length > 0) && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Internal</p>
                <div className="flex flex-wrap gap-1.5">
                  {resolvedInternal.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href as never}
                      className="rounded bg-muted px-2 py-0.5 text-xs hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {internalMdLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href as never}
                      className="rounded bg-muted px-2 py-0.5 text-xs hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {externalLinks.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">External</p>
                <div className="grid gap-1">
                  {externalLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-primary hover:underline"
                      title={l.href}
                    >
                      ↗ {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border p-4">
          <p className="mb-2 font-medium text-foreground">Tips</p>
          <ul className="grid gap-1.5 text-xs">
            <li>
              Use <code className="rounded bg-muted px-1">[[concept]]</code> to link to KB notes —
              creates graph edges automatically.
            </li>
            <li>Use headings to section your day: Learned, Blockers, Ideas, Insights.</li>
            <li>Use task lists to track action items.</li>
            <li>One log per day, keyed by date.</li>
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
              <kbd className="rounded bg-muted px-1">Ctrl+E</kbd>{" "}
              <kbd className="rounded bg-muted px-1">Ctrl+`</kbd> Inline code
            </li>
            <li>
              <kbd className="rounded bg-muted px-1">Tab</kbd> Move between table cells
            </li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
