import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listBoards } from "@/features/board/repository";
import { NewBoardButton } from "@/features/board/new-board-button";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const boards = await listBoards();
  return (
    <>
      <PageHeader
        title="Boards"
        description="Excalidraw scenes for architecture diagrams linked to notes and blogs."
        actions={<NewBoardButton />}
      />
      {boards.length ? (
        <div className="grid gap-2">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="rounded-lg border p-4 hover:bg-muted"
            >
              <h2 className="text-sm font-semibold">{board.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {board.linkedNoteIds.length} notes · {board.linkedBlogIds.length} blogs
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No boards yet"
          body="Create boards for diagrams, system boundaries, and architecture recall."
        />
      )}
    </>
  );
}
