import Link from "next/link";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listBoards, listArchivedBoards, listTrashedBoards } from "@/features/board/repository";
import { NewBoardButton } from "@/features/board/new-board-button";
import { BinControls, ArchiveButton } from "@/features/shared/item-controls";
import {
  restoreBoardAction,
  permanentDeleteBoardAction,
  unarchiveBoardAction
} from "@/features/board/actions";

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

export default async function BoardsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listBoards(),
    listArchivedBoards(),
    listTrashedBoards()
  ]);

  const boards = view === "archive" ? archived : view === "bin" ? trashed : active;

  return (
    <>
      <PageHeader
        title="Boards"
        description="Excalidraw scenes for architecture diagrams linked to notes and blogs."
        actions={<NewBoardButton />}
      />

      <div className="flex gap-1 rounded-lg border p-1 self-start">
        {(
          [
            { id: "active", label: `Active (${active.length})` },
            { id: "archive", label: `Archive (${archived.length})` },
            { id: "bin", label: `Bin (${trashed.length})` }
          ] as const
        ).map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "active" ? "/board" : `/board?view=${tab.id}`}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {boards.length ? (
        <div className="grid gap-2">
          {boards.map((board) => (
            <div key={board.id} className="flex items-center justify-between rounded-lg border p-4">
              <Link href={`/board/${board.id}`} className="flex-1 hover:underline">
                <h2 className="text-sm font-semibold">{board.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {board.linkedNoteIds.length} notes · {board.linkedBlogIds.length} blogs
                  {board.previewSvg && " · has snapshot"}
                </p>
              </Link>
              {view === "bin" ? (
                <BinControls
                  onRestore={() => restoreBoardAction(board.id)}
                  onPermanentDelete={() => permanentDeleteBoardAction(board.id)}
                />
              ) : view === "archive" ? (
                <ArchiveButton
                  isArchived
                  onArchive={async () => {}}
                  onUnarchive={() => unarchiveBoardAction(board.id)}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            view === "bin"
              ? "Bin is empty"
              : view === "archive"
                ? "No archived boards"
                : "No boards yet"
          }
          body={
            view === "active"
              ? "Create boards for diagrams, system boundaries, and architecture recall."
              : view === "archive"
                ? "Archived boards are hidden from the active list."
                : "Deleted boards appear here. Restore or permanently delete them."
          }
        />
      )}
    </>
  );
}
