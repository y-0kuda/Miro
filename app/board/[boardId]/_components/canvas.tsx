"use client";

import { useState } from "react";
import { useHistory, useCanUndo, useCanRedo } from "@/liveblocks.config";

import { CanvasMode, CanvasState } from "@/types/canvas";

import { Info } from "./info";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    // ブロックが白なので、背景に少し色を足すためにbg-neutral-100を追加する
    // touch-noneはブラウザの上下のスクロールを無効にし、スクロールを自作できるようにする
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        // 実際にundoとredoを行う
        undo={history.undo}
        redo={history.redo}
        // undoとredoを行えるかのtrueとfalseの値を持っている
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </main>
  );
};
