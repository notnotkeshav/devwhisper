import "server-only";

import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { noteLinks, notes, type Note } from "@/lib/db/schema";

export async function listNotes(userId: string, limit = 50) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: and(eq(notes.userId, userId), isNull(notes.archivedAt), isNull(notes.deletedAt)),
    orderBy: desc(notes.updatedAt),
    limit
  });
}

export async function listArchivedNotes(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: and(eq(notes.userId, userId), isNotNull(notes.archivedAt), isNull(notes.deletedAt)),
    orderBy: desc(notes.updatedAt),
    limit: 50
  });
}

export async function listTrashedNotes(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: and(eq(notes.userId, userId), isNotNull(notes.deletedAt)),
    orderBy: desc(notes.updatedAt),
    limit: 50
  });
}

export async function listPinnedNotes(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.notes.findMany({
    where: and(
      eq(notes.userId, userId),
      eq(notes.pinned, true),
      isNull(notes.archivedAt),
      isNull(notes.deletedAt)
    ),
    orderBy: desc(notes.updatedAt),
    limit: 8
  });
}

export async function getNoteBySlug(slug: string, userId: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.notes.findFirst({
    where: and(eq(notes.slug, slug), eq(notes.userId, userId))
  });
}

export async function getBacklinks(slug: string) {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  return db
    .select({ source: notes, label: noteLinks.label })
    .from(noteLinks)
    .innerJoin(notes, eq(noteLinks.sourceNoteId, notes.id))
    .where(eq(noteLinks.targetSlug, slug))
    .limit(30);
}

export async function getOutgoingLinks(noteId: string) {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  return db
    .select({ targetSlug: noteLinks.targetSlug, label: noteLinks.label })
    .from(noteLinks)
    .where(eq(noteLinks.sourceNoteId, noteId))
    .limit(50);
}

export async function getRevisionQueue(userId: string) {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  return db.query.notes.findMany({
    where: and(
      eq(notes.userId, userId),
      isNull(notes.archivedAt),
      isNull(notes.deletedAt),
      or(isNull(notes.lastReviewed), eq(notes.status, "growing"))
    ),
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
  const targetBySlug = new Map(targets.map((t) => [t.slug, t.id]));

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
    where: and(eq(notes.parentId, parentId), eq(notes.status, "growing"), isNull(notes.deletedAt)),
    orderBy: desc(notes.updatedAt)
  });
}
