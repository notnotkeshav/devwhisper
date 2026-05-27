import "server-only";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs, notes, resources, topics } from "@/lib/db/schema";

export async function listTopics(userId: string) {
  if (!env.DATABASE_URL) return [];
  const db = getDb();
  const rows = await db.query.topics.findMany({
    where: eq(topics.userId, userId),
    orderBy: desc(topics.updatedAt),
    limit: 50
  });
  if (!rows.length) return [];
  const counts = await db
    .select({ topicId: notes.topicId, n: count() })
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))
    .groupBy(notes.topicId);
  const countMap = new Map(counts.map((r) => [r.topicId, r.n]));
  return rows.map((t) => ({ ...t, noteCount: countMap.get(t.id) ?? 0 }));
}

export async function getTopicBySlug(slug: string, userId: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.topics.findFirst({
    where: and(eq(topics.slug, slug), eq(topics.userId, userId))
  });
}

export async function getTopicLinkedData(topicId: string, userId: string) {
  if (!env.DATABASE_URL) {
    return { notes: [], blogs: [], resources: [] };
  }
  const db = getDb();
  const [linkedNotes, linkedBlogs, linkedResources] = await Promise.all([
    db.query.notes.findMany({
      where: and(eq(notes.topicId, topicId), eq(notes.userId, userId), isNull(notes.deletedAt)),
      orderBy: desc(notes.updatedAt),
      limit: 50
    }),
    db.query.blogs.findMany({
      where: and(eq(blogs.topicId, topicId), eq(blogs.userId, userId), isNull(blogs.deletedAt)),
      orderBy: desc(blogs.updatedAt),
      limit: 50
    }),
    db.query.resources.findMany({
      where: eq(resources.topicId, topicId),
      orderBy: desc(resources.createdAt),
      limit: 50
    })
  ]);
  return { notes: linkedNotes, blogs: linkedBlogs, resources: linkedResources };
}
