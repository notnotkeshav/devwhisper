import "server-only";

import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs, notes, topics } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { extractWikiLinks } from "./wiki-links";

/**
 * Resolves wiki-link slugs to their correct href across notes, blogs, and topics.
 * Priority: notes → blogs → topics. Falls back to /kb/[slug] if not found anywhere.
 */
export async function resolveWikiLinks(markdown: string): Promise<Map<string, string>> {
  const hrefs = new Map<string, string>();
  if (!env.DATABASE_URL) return hrefs;

  const wikiLinks = extractWikiLinks(markdown);
  if (!wikiLinks.length) return hrefs;

  const slugs = wikiLinks.map((l) => l.slug);
  const db = getDb();

  const [noteRows, blogRows, topicRows] = await Promise.all([
    db.query.notes.findMany({ where: inArray(notes.slug, slugs), columns: { slug: true } }),
    db.query.blogs.findMany({ where: inArray(blogs.slug, slugs), columns: { slug: true } }),
    db.query.topics.findMany({ where: inArray(topics.slug, slugs), columns: { slug: true } })
  ]);

  // Lower priority first so higher priority overwrites
  for (const t of topicRows) hrefs.set(t.slug, `/topics/${t.slug}`);
  for (const b of blogRows) hrefs.set(b.slug, `/blogs/${b.slug}`);
  for (const n of noteRows) hrefs.set(n.slug, `/kb/${n.slug}`);

  return hrefs;
}
