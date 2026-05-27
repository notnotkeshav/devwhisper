"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Strikethrough,
  Table as TableIcon
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils/cn";
import type { Board } from "@/lib/db/schema";
import { slugify } from "@/lib/utils/slug";

const lowlight = createLowlight(common);

export type InternalLink = { label: string; href: string; type: "note" | "blog" | "topic" };

interface Props {
  initialContent: string;
  onChange: (markdown: string) => void;
  onHtmlChange?: (html: string) => void;
  boards?: Pick<Board, "id" | "title" | "previewSvg">[];
  internalLinks?: InternalLink[];
}

// Adds Ctrl+` as an alias for toggleCode
const InlineCodeShortcut = Extension.create({
  name: "inlineCodeShortcut",
  addKeyboardShortcuts() {
    return {
      "Mod-`": () => this.editor.commands.toggleCode()
    };
  }
});

// Prevents Tab from creating a new row when at the last table cell
const NoTabNewRow = Extension.create({
  name: "noTabNewRow",
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!this.editor.isActive("table")) return false;
        this.editor.commands.goToNextCell();
        return true; // Always consume Tab in a table — never let default "add row" handler run
      }
    };
  }
});

function ToolbarButton({
  active,
  onClick,
  title,
  children
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded text-sm transition-colors hover:bg-muted",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

/** Link insertion dialog — supports external URLs + optional internal link picker */
function LinkDialog({
  open,
  onOpenChange,
  initialUrl,
  internalLinks,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialUrl: string;
  internalLinks: InternalLink[];
  onConfirm: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = internalLinks.filter(
    (l) =>
      !search ||
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.href.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel: Record<InternalLink["type"], string> = {
    note: "Note",
    blog: "Blog",
    topic: "Topic"
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-4 shadow-2xl">
          <VisuallyHidden>
            <Dialog.Description>Insert or edit a link</Dialog.Description>
          </VisuallyHidden>
          <Dialog.Title className="mb-3 text-sm font-semibold">Insert link</Dialog.Title>

          <div className="grid gap-3">
            {/* External URL */}
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">External URL</label>
              <input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onConfirm(url);
                    onOpenChange(false);
                  }
                }}
              />
            </div>

            {/* Internal link picker */}
            {internalLinks.length > 0 && (
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Or pick an internal page
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes, blogs, topics…"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {filtered.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground">No results.</p>
                  ) : (
                    filtered.slice(0, 30).map((l) => (
                      <button
                        key={l.href}
                        type="button"
                        onClick={() => {
                          onConfirm(l.href);
                          onOpenChange(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                      >
                        <span className="truncate">{l.label}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {typeLabel[l.type]}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2">
              {url && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => {
                    onConfirm("");
                    onOpenChange(false);
                  }}
                >
                  Remove link
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(url);
                    onOpenChange(false);
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Table insert dialog — lets user choose rows and columns */
function TableDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (rows: number, cols: number) => void;
}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(320px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-4 shadow-2xl">
          <VisuallyHidden>
            <Dialog.Description>Configure table size</Dialog.Description>
          </VisuallyHidden>
          <Dialog.Title className="mb-3 text-sm font-semibold">Insert table</Dialog.Title>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm(rows, cols);
                  onOpenChange(false);
                }}
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                Insert
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Regex matching both [[label]] and TipTap-escaped \[\[label\]\]
const wikiLinkHtmlPattern = /\\?\[\\?\[([^\]\\|]+)(?:\|([^\]\\]+))?\\?\]\\?\]/g;

export function BlogEditor({
  initialContent,
  onChange,
  onHtmlChange,
  boards = [],
  internalLinks = []
}: Props) {
  const [boardPickerOpen, setBoardPickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  // Ref so the useEditor callback always reads current internalLinks without recreating the editor
  const internalLinksRef = useRef(internalLinks);
  useEffect(() => {
    internalLinksRef.current = internalLinks;
  }, [internalLinks]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      InlineCodeShortcut,
      NoTabNewRow,
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: false })
    ],
    content: "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      const manager = (
        editor as unknown as {
          storage: { markdown: { manager: { serialize: (json: unknown) => string } } };
        }
      ).storage.markdown.manager;
      onChange(manager.serialize(editor.getJSON()));

      if (onHtmlChange) {
        // Post-process HTML: convert [[wiki-link]] text nodes to <a> links
        const links = internalLinksRef.current;
        const html = editor
          .getHTML()
          .replace(wikiLinkHtmlPattern, (_, label: string, alias?: string) => {
            const text = alias?.trim() ?? label.trim();
            const match = links.find((l) => l.label.toLowerCase() === label.trim().toLowerCase());
            const href = match?.href ?? `/kb/${slugify(label.trim())}`;
            return `<a href="${href}" class="text-primary hover:underline">${text}</a>`;
          });
        onHtmlChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[480px] rounded-b-lg border-x border-b bg-background p-4 text-sm focus:outline-none"
      }
    }
  });

  useEffect(() => {
    if (!editor || !initialContent) return;
    const manager = (
      editor as unknown as {
        storage: { markdown: { manager: { parse: (s: string) => unknown } } };
      }
    ).storage.markdown.manager;
    const doc = manager.parse(initialContent);
    editor.commands.setContent(doc as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  function insertBoard(board: Pick<Board, "id" | "title" | "previewSvg">) {
    if (!editor) return;
    setBoardPickerOpen(false);
    if (board.previewSvg) {
      editor
        .chain()
        .focus()
        .setImage({ src: `/api/boards/${board.id}/preview`, alt: `Board: ${board.title}` })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(
          `\n> **Board: ${board.title}** — no snapshot yet. Open the board and click Snapshot.\n`
        )
        .run();
    }
  }

  function openLinkDialog() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    setCurrentLinkUrl(prev ?? "");
    setLinkDialogOpen(true);
  }

  function applyLink(url: string) {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^https?:\/\/|^\/|^#|^mailto:/i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
  }

  if (!editor) return null;

  return (
    <div className="grid gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border bg-card px-2 py-1.5">
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Bold (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code (Ctrl+E or Ctrl+`)"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Task / checklist"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListTodo className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Insert table (choose rows & columns)"
          active={editor.isActive("table")}
          onClick={() => setTableDialogOpen(true)}
        >
          <TableIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Insert / edit link"
          active={editor.isActive("link")}
          onClick={openLinkDialog}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>

        {boards.length > 0 && (
          <>
            <Separator />
            <Dialog.Root open={boardPickerOpen} onOpenChange={setBoardPickerOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  title="Insert board snapshot"
                  className="flex h-7 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ImageIcon className="size-4" aria-hidden />
                  Insert board
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-4 shadow-2xl">
                  <VisuallyHidden>
                    <Dialog.Description>Pick a board to embed its snapshot</Dialog.Description>
                  </VisuallyHidden>
                  <Dialog.Title className="mb-3 text-sm font-semibold">
                    Insert board snapshot
                  </Dialog.Title>
                  <div className="grid gap-1">
                    {boards.map((board) => (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => insertBoard(board)}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                      >
                        <span>{board.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {board.previewSvg ? "has snapshot" : "no snapshot"}
                        </span>
                      </button>
                    ))}
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
      </div>

      <EditorContent editor={editor} />

      <LinkDialog
        key={linkDialogOpen ? currentLinkUrl : "closed"}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={currentLinkUrl}
        internalLinks={internalLinks}
        onConfirm={applyLink}
      />

      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onConfirm={(rows, cols) =>
          editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
        }
      />
    </div>
  );
}
