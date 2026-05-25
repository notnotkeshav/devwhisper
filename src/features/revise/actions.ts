"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes, revisionLogs } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";

export async function markReviewedAction(noteId: string, confidence: number) {
  const user = await requireUser();
  const db = getDb();

  const note = await db.query.notes.findFirst({ where: eq(notes.id, noteId) });
  if (!note) return;

  const newRevisionCount = note.revisionCount + 1;
  const newInterval = Math.round(note.revisionIntervalDays * (1 + confidence));
  const newMastery = Math.min(1, note.masteryScore + confidence * 0.1);
  const newForgetting = Math.max(0, note.forgettingScore - confidence * 0.2);

  await db
    .update(notes)
    .set({
      confidenceScore: confidence,
      masteryScore: newMastery,
      forgettingScore: newForgetting,
      revisionCount: newRevisionCount,
      revisionIntervalDays: newInterval,
      lastReviewed: new Date(),
      updatedAt: new Date()
    })
    .where(eq(notes.id, noteId));

  await db.insert(revisionLogs).values({
    userId: user.id,
    noteId,
    mode: "quick",
    confidence,
    forgettingScore: newForgetting,
    durationSeconds: 0
  });

  revalidatePath("/revise");
}
