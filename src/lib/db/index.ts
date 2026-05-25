import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  devwhisperSql?: postgres.Sql;
};

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  const client =
    globalForDb.devwhisperSql ??
    postgres(env.DATABASE_URL, {
      max: 1,
      prepare: false,
      idle_timeout: 20
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.devwhisperSql = client;
  }

  return drizzle(client, { schema });
}
