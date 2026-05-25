import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { boards } from "@/lib/db/schema";

export async function listBoards() {
  if (!env.DATABASE_URL) return [];
  return getDb().query.boards.findMany({ orderBy: desc(boards.updatedAt), limit: 50 });
}

export async function getBoard(id: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.boards.findFirst({ where: eq(boards.id, id) });
}
