import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs, boards, notes, topics } from "@/lib/db/schema";
import type { SearchResult } from "./types";

export async function globalSearch(
  query: string,
  userId: string,
  limit = 20
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  // Build a prefix tsquery: each word gets :* so "rea" matches "react", "read", etc.
  const prefixQuery = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "") + ":*")
    .join(" & ");

  const likePattern = `%${trimmed}%`;

  const rows = await db.execute(sql<SearchResult>`
    select id::text, 'note' as type, title, slug,
      left(markdown, 220) as excerpt,
      ts_rank(to_tsvector('english', title || ' ' || markdown), to_tsquery('english', ${prefixQuery})) as score
    from ${notes}
    where user_id = ${userId}
      and deleted_at is null
      and to_tsvector('english', title || ' ' || markdown) @@ to_tsquery('english', ${prefixQuery})
    union all
    select id::text, 'blog' as type, title, slug,
      left(mdx, 220) as excerpt,
      ts_rank(to_tsvector('english', title || ' ' || mdx), to_tsquery('english', ${prefixQuery})) as score
    from ${blogs}
    where user_id = ${userId}
      and deleted_at is null
      and to_tsvector('english', title || ' ' || mdx) @@ to_tsquery('english', ${prefixQuery})
    union all
    select id::text, 'topic' as type, title, slug,
      left(description, 220) as excerpt,
      similarity(title, ${trimmed}) as score
    from ${topics}
    where user_id = ${userId}
      and (title ilike ${likePattern} or description ilike ${likePattern})
    union all
    select id::text, 'board' as type, title, slug,
      'Visual diagram board' as excerpt,
      similarity(title, ${trimmed}) as score
    from ${boards}
    where user_id = ${userId}
      and title ilike ${likePattern}
    order by score desc
    limit ${safeLimit}
  `);

  return rows as unknown as SearchResult[];
}
