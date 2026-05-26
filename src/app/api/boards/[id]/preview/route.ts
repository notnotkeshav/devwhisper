import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { env } from "@/lib/env";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!env.DATABASE_URL) return new NextResponse("Not found", { status: 404 });
  const { id } = await params;
  const board = await getDb().query.boards.findFirst({
    where: eq(boards.id, id),
    columns: { previewSvg: true }
  });
  if (!board?.previewSvg) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(board.previewSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
