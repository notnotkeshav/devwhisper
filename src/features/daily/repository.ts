import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { dailyNotes } from "@/lib/db/schema";

export async function listDailyNotes(limit = 30) {
  if (!env.DATABASE_URL) return [];
  return getDb().query.dailyNotes.findMany({ orderBy: desc(dailyNotes.day), limit });
}

export async function getDailyNote(day: string) {
  if (!env.DATABASE_URL) return null;
  return getDb().query.dailyNotes.findFirst({ where: eq(dailyNotes.day, day) });
}
