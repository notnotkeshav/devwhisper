import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { boards } from "@/lib/db/schema";

export async function listBoards(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.boards.findMany({
    where: and(eq(boards.userId, userId), isNull(boards.archivedAt), isNull(boards.deletedAt)),
    orderBy: desc(boards.updatedAt),
    limit: 50
  });
}

export async function listArchivedBoards(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.boards.findMany({
    where: and(eq(boards.userId, userId), isNotNull(boards.archivedAt), isNull(boards.deletedAt)),
    orderBy: desc(boards.updatedAt),
    limit: 50
  });
}

export async function listTrashedBoards(userId: string) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.boards.findMany({
    where: and(eq(boards.userId, userId), isNotNull(boards.deletedAt)),
    orderBy: desc(boards.updatedAt),
    limit: 50
  });
}

export async function getBoard(id: string, userId: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.boards.findFirst({
    where: and(eq(boards.id, id), eq(boards.userId, userId))
  });
}
