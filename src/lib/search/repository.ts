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
  if (!query.trim()) return [];
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const rows = await db.execute(sql<SearchResult>`
    select id::text, 'note' as type, title, slug,
      left(markdown, 220) as excerpt,
      ts_rank(to_tsvector('english', title || ' ' || markdown), plainto_tsquery('english', ${query})) as score
    from ${notes}
    where user_id = ${userId}
      and to_tsvector('english', title || ' ' || markdown) @@ plainto_tsquery('english', ${query})
    union all
    select id::text, 'blog' as type, title, slug,
      left(mdx, 220) as excerpt,
      ts_rank(to_tsvector('english', title || ' ' || mdx), plainto_tsquery('english', ${query})) as score
    from ${blogs}
    where user_id = ${userId}
      and to_tsvector('english', title || ' ' || mdx) @@ plainto_tsquery('english', ${query})
    union all
    select id::text, 'topic' as type, title, slug,
      left(description, 220) as excerpt,
      similarity(title, ${query}) as score
    from ${topics}
    where user_id = ${userId}
      and (title ilike '%' || ${query} || '%' or description ilike '%' || ${query} || '%')
    union all
    select id::text, 'board' as type, title, slug,
      'Architecture board' as excerpt,
      similarity(title, ${query}) as score
    from ${boards}
    where user_id = ${userId}
      and title ilike '%' || ${query} || '%'
    order by score desc
    limit ${safeLimit}
  `);

  return rows as unknown as SearchResult[];
}
