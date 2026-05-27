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
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const board = await getBoard(id, user.id);
  if (!board) notFound();
  return (
    <>
      <PageHeader
        title={board.title}
        eyebrow={board.archivedAt ? "Archived" : "Board"}
        description="Pan, zoom, and draw — scenes are saved automatically as portable JSON."
        actions={
          <div className="flex gap-2">
            <ArchiveButton
              isArchived={!!board.archivedAt}
              onArchive={archiveBoardAction.bind(null, board.id)}
              onUnarchive={unarchiveBoardAction.bind(null, board.id)}
            />
            <TrashButton onTrash={trashBoardAction.bind(null, board.id)} />
          </div>
        }
      />
      <BoardCanvas boardId={board.id} initialScene={board.scene} />
    </>
  );
}
