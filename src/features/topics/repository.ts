import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { topics } from "@/lib/db/schema";

export async function listTopics() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.topics.findMany({ orderBy: desc(topics.updatedAt), limit: 50 });
}

export async function getTopicBySlug(slug: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.topics.findFirst({ where: eq(topics.slug, slug) });
}
