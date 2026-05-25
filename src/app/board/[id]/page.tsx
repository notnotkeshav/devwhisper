import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getBoard } from "@/features/board/repository";
import { BoardCanvas } from "@/features/board/board-canvas";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const board = await getBoard(id);
  if (!board) notFound();
  return (
    <>
      <PageHeader
        title={board.title}
        description="Pan, zoom, draw, and preserve JSON scene data for portable diagrams."
      />
      <BoardCanvas boardId={board.id} initialScene={board.scene} />
    </>
  );
}
