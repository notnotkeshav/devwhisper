"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { resources, topics } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { z } from "zod";

const topicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default("")
});

export async function createTopicAction(formData: FormData) {
  const user = await requireUser();
  const parsed = topicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? ""
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid topic.");

  const db = getDb();
  const slug = slugify(parsed.data.title);
  await db.insert(topics).values({
    userId: user.id,
    title: parsed.data.title,
    slug,
    description: parsed.data.description
  });

  revalidatePath("/topics");
  redirect(`/topics/${slug}`);
}

const resourceSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  url: z.string().optional(),
  kind: z.enum(["link", "book", "video", "article", "doc", "other"]).default("link"),
  notes: z.string().default("")
});

export async function createResourceAction(formData: FormData) {
  const user = await requireUser();
  const parsed = resourceSchema.safeParse({
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    url: formData.get("url") || undefined,
    kind: formData.get("kind") || "link",
    notes: formData.get("notes") || ""
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid resource.");

  const db = getDb();
  const rawUrl = parsed.data.url;
  const url = rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;

  await db.insert(resources).values({
    userId: user.id,
    topicId: parsed.data.topicId,
    title: parsed.data.title,
    url: url ?? null,
    kind: parsed.data.kind,
    notes: parsed.data.notes
  });

  revalidatePath(`/topics`);
}

export async function deleteResourceAction(resourceId: string, topicSlug: string) {
  await requireUser();
  const db = getDb();
  await db.delete(resources).where(eq(resources.id, resourceId));
  revalidatePath(`/topics/${topicSlug}`);
}

export async function deleteTopicAction(topicId: string) {
  await requireUser();
  const db = getDb();
  await db.delete(topics).where(eq(topics.id, topicId));
  revalidatePath("/topics");
  redirect("/topics");
}
