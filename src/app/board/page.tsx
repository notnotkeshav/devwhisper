import Link from "next/link";
import Image from "next/image";
import { Camera, LayoutDashboard } from "lucide-react";
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
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type View = "active" | "archive" | "bin";

export default async function BoardsPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "archive" ? "archive" : viewParam === "bin" ? "bin" : "active";

  const [active, archived, trashed] = await Promise.all([
    listBoards(user.id),
    listArchivedBoards(user.id),
    listTrashedBoards(user.id)
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex flex-col rounded-lg border transition-colors hover:bg-muted/50"
            >
              {/* Snapshot preview */}
              <Link href={`/board/${board.id}`} className="block">
                {board.previewSvg ? (
                  <div className="relative h-36 overflow-hidden rounded-t-lg bg-muted">
                    <Image
                      src={`/api/boards/${board.id}/preview`}
                      alt={`${board.title} preview`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-t-lg bg-muted/40">
                    <LayoutDashboard className="size-8 text-muted-foreground/30" aria-hidden />
                  </div>
                )}
              </Link>

              <div className="flex flex-1 items-start justify-between gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/board/${board.id}`} className="block">
                    <h2 className="truncate text-sm font-semibold hover:text-primary">
                      {board.title}
                    </h2>
                  </Link>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {board.linkedNoteIds.length} notes · {board.linkedBlogIds.length} blogs
                    {board.previewSvg && (
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <Camera className="size-3" aria-hidden />
                        snapshot
                      </span>
                    )}
                  </p>
                </div>
                {view === "bin" ? (
                  <BinControls
                    onRestore={restoreBoardAction.bind(null, board.id)}
                    onPermanentDelete={permanentDeleteBoardAction.bind(null, board.id)}
                  />
                ) : view === "archive" ? (
                  <ArchiveButton
                    isArchived
                    onUnarchive={unarchiveBoardAction.bind(null, board.id)}
                  />
                ) : null}
              </div>
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
