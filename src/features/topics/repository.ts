import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { flashcards, notes, resources, topics } from "@/lib/db/schema";

export async function listTopics(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.topics.findMany({
    where: eq(topics.userId, userId),
    orderBy: desc(topics.updatedAt),
    limit: 50
  });
}

export async function getTopicBySlug(slug: string, userId: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.topics.findFirst({
    where: and(eq(topics.slug, slug), eq(topics.userId, userId))
  });
}

export async function getTopicLinkedData(topicId: string, userId: string) {
  if (!env.DATABASE_URL) {
    return { notes: [], resources: [], flashcards: [] };
  }
  const db = getDb();
  const [linkedNotes, linkedResources, linkedFlashcards] = await Promise.all([
    db.query.notes.findMany({
      where: and(eq(notes.topicId, topicId), eq(notes.userId, userId), isNull(notes.deletedAt)),
      orderBy: desc(notes.updatedAt),
      limit: 50
    }),
    db.query.resources.findMany({
      where: eq(resources.topicId, topicId),
      orderBy: desc(resources.createdAt),
      limit: 50
    }),
    db.query.flashcards.findMany({
      where: and(eq(flashcards.topicId, topicId), eq(flashcards.userId, userId)),
      orderBy: desc(flashcards.createdAt),
      limit: 50
    })
  ]);
  return { notes: linkedNotes, resources: linkedResources, flashcards: linkedFlashcards };
}
