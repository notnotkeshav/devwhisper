"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { extractWikiLinks } from "@/lib/markdown/wiki-links";
import { slugify } from "@/lib/utils/slug";
import { noteFormSchema } from "./validation";
import { upsertNoteLinks } from "./repository";

export async function saveNoteAction(formData: FormData) {
  const parsed = noteFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    markdown: formData.get("markdown"),
    shortSummary: formData.get("shortSummary") || undefined,
    mediumSummary: formData.get("mediumSummary") || undefined,
    deepSummary: formData.get("deepSummary") || undefined,
    status: formData.get("status") || "seed"
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid note.");
  }

  const db = getDb();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const existing = await db.query.notes.findFirst({ where: eq(notes.slug, slug) });

  const values = {
    title: parsed.data.title,
    slug,
    markdown: parsed.data.markdown,
    shortSummary: parsed.data.shortSummary ?? "",
    mediumSummary: parsed.data.mediumSummary ?? "",
    deepSummary: parsed.data.deepSummary ?? "",
    status: parsed.data.status,
    updatedAt: new Date()
  };

  const [saved] = existing
    ? await db.update(notes).set(values).where(eq(notes.id, existing.id)).returning()
    : await db.insert(notes).values(values).returning();

  const wikiLinks = extractWikiLinks(parsed.data.markdown);
  await upsertNoteLinks(
    saved,
    wikiLinks.map((link) => ({ slug: link.slug, label: link.alias ?? link.label }))
  );

  revalidatePath("/kb");
  revalidatePath(`/kb/${slug}`);
  redirect(`/kb/${slug}`);
}
