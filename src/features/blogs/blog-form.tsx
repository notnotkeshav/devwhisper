"use client";

import { useTransition, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Blog, Board } from "@/lib/db/schema";
import { saveBlogAction } from "./actions";
import { BlogEditor } from "./blog-editor";

interface Props {
  blog?: Blog | null;
  boards?: Pick<Board, "id" | "title" | "previewSvg">[];
}

export function BlogForm({ blog, boards = [] }: Props) {
  const [pending, startTransition] = useTransition();
  const [mdx, setMdx] = useState(blog?.mdx ?? "");

  function handleSubmit(fd: FormData) {
    fd.set("mdx", mdx);
    startTransition(() => saveBlogAction(fd));
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-[1fr_260px]">
        <Input name="title" defaultValue={blog?.title} required placeholder="Title" />
        <Input name="slug" defaultValue={blog?.slug} placeholder="slug (auto-generated)" />
      </div>
      <Input name="series" defaultValue={blog?.series ?? ""} placeholder="Series name (optional)" />
      <Textarea
        name="excerpt"
        defaultValue={blog?.excerpt}
        placeholder="Short excerpt shown in listings"
        className="min-h-20"
      />
      <BlogEditor initialContent={mdx} onChange={setMdx} boards={boards} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : "Save blog"}
        </Button>
      </div>
    </form>
  );
}
