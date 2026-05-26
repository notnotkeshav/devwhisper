"use client";

import { useEditor, EditorContent } from "@tiptap/react";
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
import { useEffect, useState } from "react";
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

const lowlight = createLowlight(common);

interface Props {
  initialContent: string;
  onChange: (markdown: string) => void;
  boards?: Pick<Board, "id" | "title" | "previewSvg">[];
}

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

export function BlogEditor({ initialContent, onChange, boards = [] }: Props) {
  const [boardPickerOpen, setBoardPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: { openOnClick: false } }),
      Markdown,
      Placeholder.configure({ placeholder: "Start writing your blog post…" }),
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
    // only run on mount — initialContent changes are intentionally ignored
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

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
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
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
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
          title="Inline code"
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
          title="Task list"
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
          title="Insert table"
          active={editor.isActive("table")}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
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

        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
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
                        {board.previewSvg ? (
                          <span className="text-xs text-muted-foreground">has snapshot</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">no snapshot</span>
                        )}
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
    </div>
  );
}
