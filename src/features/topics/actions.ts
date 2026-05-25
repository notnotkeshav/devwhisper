"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { topics } from "@/lib/db/schema";
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

export async function deleteTopicAction(topicId: string) {
  await requireUser();
  const db = getDb();
  await db.delete(topics).where(eq(topics.id, topicId));
  revalidatePath("/topics");
  redirect("/topics");
}
