"use client";

import { useTransition, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import type { Blog, Board } from "@/lib/db/schema";
import { saveBlogAction } from "./actions";
import { BlogEditor, type InternalLink } from "./blog-editor";

type TopicOption = { id: string; title: string };

interface Props {
  blog?: Blog | null;
  boards?: Pick<Board, "id" | "title" | "previewSvg">[];
  internalLinks?: InternalLink[];
  topics?: TopicOption[];
}

export function BlogForm({ blog, boards = [], internalLinks = [], topics = [] }: Props) {
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
        <Input
          name="slug"
          defaultValue={blog?.slug}
          placeholder="slug (auto-generated)"
          readOnly={!!blog}
          className={blog ? "cursor-not-allowed opacity-60" : ""}
          title={blog ? "Slug is locked after first save" : undefined}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          name="series"
          defaultValue={blog?.series ?? ""}
          placeholder="Series name (optional)"
          className="flex-1"
        />
        {topics.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Topic
            </label>
            <Select
              name="topicId"
              defaultValue={blog?.topicId ?? "__none__"}
              placeholder="No topic"
              className="w-44"
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
      </div>
      <Textarea
        name="excerpt"
        defaultValue={blog?.excerpt}
        placeholder="Short excerpt shown in listings"
        className="min-h-20"
      />
      <BlogEditor
        initialContent={mdx}
        onChange={setMdx}
        boards={boards}
        internalLinks={internalLinks}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : "Save blog"}
        </Button>
      </div>
    </form>
  );
}
