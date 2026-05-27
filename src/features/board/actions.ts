"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { z } from "zod";

const boardFormSchema = z.object({
  title: z.string().min(1, "Title is required")
});

export async function createBoardAction(formData: FormData) {
  const user = await requireUser();
  const parsed = boardFormSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid board.");

  const db = getDb();
  const slug = slugify(parsed.data.title);
  const [board] = await db
    .insert(boards)
    .values({ userId: user.id, title: parsed.data.title, slug })
    .returning({ id: boards.id });

  revalidatePath("/boards");
  redirect(`/boards/${board.id}`);
}

export async function saveBoardSceneAction(boardId: string, scene: Record<string, unknown>) {
  await requireUser();
  const db = getDb();
  await db.update(boards).set({ scene, updatedAt: new Date() }).where(eq(boards.id, boardId));
  revalidatePath(`/boards/${boardId}`);
}

export async function saveBoardSnapshotAction(boardId: string, previewSvg: string) {
  await requireUser();
  const db = getDb();
  await db.update(boards).set({ previewSvg, updatedAt: new Date() }).where(eq(boards.id, boardId));
  revalidatePath(`/boards/${boardId}`);
}

export async function archiveBoardAction(boardId: string) {
  await requireUser();
  const db = getDb();
  await db
    .update(boards)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(boards.id, boardId));
  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
}

export async function unarchiveBoardAction(boardId: string) {
  await requireUser();
  const db = getDb();
  await db
    .update(boards)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(boards.id, boardId));
  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
}

export async function trashBoardAction(boardId: string) {
  await requireUser();
  const db = getDb();
  await db
    .update(boards)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(boards.id, boardId));
  revalidatePath("/boards");
  redirect("/boards");
}

export async function restoreBoardAction(boardId: string) {
  await requireUser();
  const db = getDb();
  await db
    .update(boards)
    .set({ deletedAt: null, archivedAt: null, updatedAt: new Date() })
    .where(eq(boards.id, boardId));
  revalidatePath("/boards");
}

export async function permanentDeleteBoardAction(boardId: string) {
  await requireUser();
  const db = getDb();
  await db.delete(boards).where(eq(boards.id, boardId));
  revalidatePath("/boards");
}
