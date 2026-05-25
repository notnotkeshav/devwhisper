import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { blogs } from "@/lib/db/schema";

export async function listBlogs() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.blogs.findMany({ orderBy: desc(blogs.updatedAt), limit: 50 });
}

export async function getBlogBySlug(slug: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.blogs.findFirst({ where: eq(blogs.slug, slug) });
}
