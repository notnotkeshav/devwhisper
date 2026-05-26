import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs } from "@/lib/db/schema";

export async function listBlogs() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: and(isNull(blogs.archivedAt), isNull(blogs.deletedAt)),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function listArchivedBlogs() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: and(isNotNull(blogs.archivedAt), isNull(blogs.deletedAt)),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function listTrashedBlogs() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: isNotNull(blogs.deletedAt),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function getBlogBySlug(slug: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.blogs.findFirst({ where: eq(blogs.slug, slug) });
}
