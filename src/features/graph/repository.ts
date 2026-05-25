import "server-only";

import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs, boards, graphEdges, notes, topics } from "@/lib/db/schema";

export async function getGraphData() {
  if (!env.DATABASE_URL) {
    return { notes: [], blogs: [], topics: [], boards: [], edges: [] };
  }
  const db = getDb();
  const [noteRows, blogRows, topicRows, boardRows, edgeRows] = await Promise.all([
    db.select().from(notes).limit(100),
    db.select().from(blogs).limit(100),
    db.select().from(topics).limit(100),
    db.select().from(boards).limit(100),
    db.select().from(graphEdges).limit(300)
  ]);
  return {
    notes: noteRows,
    blogs: blogRows,
    topics: topicRows,
    boards: boardRows,
    edges: edgeRows
  };
}
