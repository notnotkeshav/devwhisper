import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/page-header";
import { getBoard } from "@/features/board/repository";
import { BoardCanvas } from "@/features/board/board-canvas";
import { ArchiveButton, TrashButton } from "@/features/shared/item-controls";
import {
  archiveBoardAction,
  unarchiveBoardAction,
  trashBoardAction
} from "@/features/board/actions";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const board = await getBoard(id);
  if (!board) notFound();
  return (
    <>
      <PageHeader
        title={board.title}
        eyebrow={board.archivedAt ? "archived" : undefined}
        description="Pan, zoom, draw, and preserve JSON scene data for portable diagrams."
        actions={
          <div className="flex gap-2">
            <ArchiveButton
              isArchived={!!board.archivedAt}
              onArchive={() => archiveBoardAction(board.id)}
              onUnarchive={() => unarchiveBoardAction(board.id)}
            />
            <TrashButton onTrash={() => trashBoardAction(board.id)} />
          </div>
        }
      />
      <BoardCanvas boardId={board.id} initialScene={board.scene} />
    </>
  );
}
