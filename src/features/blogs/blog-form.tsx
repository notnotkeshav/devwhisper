"use client";

import { useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Blog } from "@/lib/db/schema";
import { saveBlogAction } from "./actions";

export function BlogForm({ blog }: { blog?: Blog | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <form action={(fd) => startTransition(() => saveBlogAction(fd))} className="grid gap-4">
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
      <Textarea
        name="mdx"
        defaultValue={blog?.mdx}
        placeholder="Write MDX content here. Supports markdown + JSX."
        className="min-h-[480px] font-mono text-sm"
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
