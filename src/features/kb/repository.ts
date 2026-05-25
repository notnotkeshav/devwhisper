import "server-only";

import { and, desc, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { noteLinks, notes, type Note } from "@/lib/db/schema";

export async function listNotes(limit = 50) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    orderBy: desc(notes.updatedAt),
    limit
  });
}

export async function listPinnedNotes() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: eq(notes.pinned, true),
    orderBy: desc(notes.updatedAt),
    limit: 8
  });
}

export async function getNoteBySlug(slug: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.notes.findFirst({
    where: eq(notes.slug, slug)
  });
}

export async function getBacklinks(slug: string) {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  return db
    .select({
      source: notes,
      label: noteLinks.label
    })
    .from(noteLinks)
    .innerJoin(notes, eq(noteLinks.sourceNoteId, notes.id))
    .where(eq(noteLinks.targetSlug, slug))
    .limit(30);
}

export async function getRevisionQueue() {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  return db.query.notes.findMany({
    where: or(isNull(notes.lastReviewed), eq(notes.status, "growing")),
    orderBy: desc(notes.forgettingScore),
    limit: 20
  });
}

export async function upsertNoteLinks(note: Note, links: Array<{ slug: string; label: string }>) {
  const db = getDb();
  await db.delete(noteLinks).where(eq(noteLinks.sourceNoteId, note.id));

  if (!links.length) return;

  const targets = await db.query.notes.findMany({
    where: or(...links.map((link) => eq(notes.slug, link.slug)))
  });
  const targetBySlug = new Map(targets.map((target) => [target.slug, target.id]));

  await db.insert(noteLinks).values(
    links.map((link) => ({
      sourceNoteId: note.id,
      targetSlug: link.slug,
      targetNoteId: targetBySlug.get(link.slug),
      label: link.label
    }))
  );
}

export async function getChildNotes(parentId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: and(eq(notes.parentId, parentId), eq(notes.status, "growing")),
    orderBy: desc(notes.updatedAt)
  });
}
