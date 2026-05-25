"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { saveBoardSceneAction } from "./actions";

const Excalidraw = dynamic(
  async () => {
    const mod = await import("@excalidraw/excalidraw");
    return mod.Excalidraw;
  },
  { ssr: false }
);

interface Props {
  boardId: string;
  initialScene: Record<string, unknown>;
}

export function BoardCanvas({ boardId, initialScene }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const scene = {
          elements: elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            gridSize: appState.gridSize
          }
        };
        saveBoardSceneAction(boardId, scene as Record<string, unknown>);
      }, 1500);
    },
    [boardId]
  );

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[520px] overflow-hidden rounded-lg border bg-background">
      <Excalidraw
        theme="dark"
        detectScroll={false}
        handleKeyboardGlobally={true}
        initialData={Object.keys(initialScene).length > 0 ? (initialScene as never) : null}
        onChange={handleChange as never}
      />
    </div>
  );
}
