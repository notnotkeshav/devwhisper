import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs, boards, graphEdges, notes, topics } from "@/lib/db/schema";

export async function getGraphData(userId: string) {
  if (!env.DATABASE_URL) {
    return { notes: [], blogs: [], topics: [], boards: [], edges: [] };
  }
  const db = getDb();
  const [noteRows, blogRows, topicRows, boardRows, edgeRows] = await Promise.all([
    db.select().from(notes).where(eq(notes.userId, userId)).limit(100),
    db.select().from(blogs).where(eq(blogs.userId, userId)).limit(100),
    db.select().from(topics).where(eq(topics.userId, userId)).limit(100),
    db.select().from(boards).where(eq(boards.userId, userId)).limit(100),
    db.select().from(graphEdges).where(eq(graphEdges.userId, userId)).limit(300)
  ]);
  return {
    notes: noteRows,
    blogs: blogRows,
    topics: topicRows,
    boards: boardRows,
    edges: edgeRows
  };
}
