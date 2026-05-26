"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveBoardSceneAction, saveBoardSnapshotAction } from "./actions";

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
  const elementsRef = useRef<readonly unknown[]>([]);
  const appStateRef = useRef<Record<string, unknown>>({});
  const [snapping, setSnapping] = useState(false);

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>) => {
      elementsRef.current = elements;
      appStateRef.current = appState;

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

  async function handleSnapshot() {
    if (elementsRef.current.length === 0) return;
    setSnapping(true);
    try {
      const { exportToSvg } = await import("@excalidraw/excalidraw");
      const svgEl = await exportToSvg({
        elements: elementsRef.current as never,
        appState: {
          ...appStateRef.current,
          exportWithDarkMode: true,
          exportBackground: true
        } as never,
        files: null,
        skipInliningFonts: true
      });
      const svgString = new XMLSerializer().serializeToString(svgEl);
      await saveBoardSnapshotAction(boardId, svgString);
    } finally {
      setSnapping(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSnapshot}
          disabled={snapping}
          title="Save a snapshot of the current board as an embeddable image"
        >
          <Camera className="size-4" aria-hidden />
          {snapping ? "Saving snapshot…" : "Snapshot"}
        </Button>
      </div>
      <div className="h-[calc(100vh-13rem)] min-h-[520px] overflow-hidden rounded-lg border bg-background">
        <Excalidraw
          theme="dark"
          detectScroll={false}
          handleKeyboardGlobally={true}
          initialData={Object.keys(initialScene).length > 0 ? (initialScene as never) : null}
          onChange={handleChange as never}
        />
      </div>
    </div>
  );
}
