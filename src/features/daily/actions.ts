"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dailyNotes } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";

export async function saveDailyNoteAction(formData: FormData) {
  const user = await requireUser();
  const day = formData.get("day") as string;
  const markdown = (formData.get("markdown") as string) ?? "";

  if (!day) throw new Error("Day is required.");

  const db = getDb();
  const existing = await db.query.dailyNotes.findFirst({
    where: eq(dailyNotes.day, day)
  });

  if (existing) {
    await db
      .update(dailyNotes)
      .set({ markdown, updatedAt: new Date() })
      .where(eq(dailyNotes.id, existing.id));
  } else {
    await db.insert(dailyNotes).values({ userId: user.id, day, markdown });
  }

  revalidatePath(`/daily/${day}`);
  revalidatePath("/daily");
}
