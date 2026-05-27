"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { extractWikiLinks, extractMarkdownLinks } from "@/lib/markdown/wiki-links";
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
    status: formData.get("status") || "seed",
    topicId:
      formData.get("topicId") === "__none__" ? undefined : formData.get("topicId") || undefined
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
    topicId: parsed.data.topicId ?? null,
    updatedAt: new Date()
  };

  const [saved] = existing
    ? await db.update(notes).set(values).where(eq(notes.id, existing.id)).returning()
    : await db.insert(notes).values(values).returning();

  const wikiLinks = extractWikiLinks(parsed.data.markdown);
  const mdLinks = extractMarkdownLinks(parsed.data.markdown)
    .filter((l) => !l.isExternal && l.href.startsWith("/kb/"))
    .map((l) => ({ slug: l.href.replace(/^\/kb\//, "").split("/")[0]!, label: l.label }));
  const merged = new Map<string, { slug: string; label: string }>();
  for (const l of wikiLinks) merged.set(l.slug, { slug: l.slug, label: l.alias ?? l.label });
  for (const l of mdLinks) if (!merged.has(l.slug)) merged.set(l.slug, l);
  await upsertNoteLinks(saved, [...merged.values()]);

  revalidatePath("/kb");
  revalidatePath(`/kb/${slug}`);
  redirect(`/kb/${slug}`);
}

export async function togglePinNoteAction(noteId: string, currentlyPinned: boolean) {
  const db = getDb();
  await db
    .update(notes)
    .set({ pinned: !currentlyPinned, updatedAt: new Date() })
    .where(eq(notes.id, noteId));
  revalidatePath("/kb");
  revalidatePath("/dashboard");
}

export async function archiveNoteAction(noteId: string) {
  const db = getDb();
  await db
    .update(notes)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(notes.id, noteId));
  revalidatePath("/kb");
}

export async function unarchiveNoteAction(noteId: string) {
  const db = getDb();
  await db
    .update(notes)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(notes.id, noteId));
  revalidatePath("/kb");
}

export async function trashNoteAction(noteId: string) {
  const db = getDb();
  const note = await db.query.notes.findFirst({ where: eq(notes.id, noteId) });
  if (!note) throw new Error("Note not found.");
  await db
    .update(notes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(notes.id, noteId));
  revalidatePath("/kb");
  redirect("/kb");
}

export async function restoreNoteAction(noteId: string) {
  const db = getDb();
  await db
    .update(notes)
    .set({ deletedAt: null, archivedAt: null, updatedAt: new Date() })
    .where(eq(notes.id, noteId));
  revalidatePath("/kb");
}

export async function permanentDeleteNoteAction(noteId: string) {
  const db = getDb();
  await db.delete(notes).where(eq(notes.id, noteId));
  revalidatePath("/kb");
}
