import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs } from "@/lib/db/schema";

export async function listBlogs(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: and(eq(blogs.userId, userId), isNull(blogs.archivedAt), isNull(blogs.deletedAt)),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function listArchivedBlogs(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: and(eq(blogs.userId, userId), isNotNull(blogs.archivedAt), isNull(blogs.deletedAt)),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function listTrashedBlogs(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({
    where: and(eq(blogs.userId, userId), isNotNull(blogs.deletedAt)),
    orderBy: desc(blogs.updatedAt),
    limit: 50
  });
}

export async function getBlogBySlug(slug: string, userId: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.blogs.findFirst({
    where: and(eq(blogs.slug, slug), eq(blogs.userId, userId))
  });
}

export async function getBlogBySlugPublic(slug: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.blogs.findFirst({
    where: and(eq(blogs.slug, slug), isNull(blogs.deletedAt))
  });
}
