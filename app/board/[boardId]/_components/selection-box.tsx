"use client";

import { memo } from "react";

import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@/liveblocks.config";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

// 四角形の隅で使う丸い点で使うpx
const HANDLE_WIDTH = 8;

export const SelectionBox = memo(
  ({ onResizeHandlePointerDown }: SelectionBoxProps) => {
    // 選んだlayerの情報を取得
    const soloLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null
    );

    // Path = ペン
    // 選んだレイヤがペンでないかどうか
    const isShowingHandles = useStorage(
      (root) =>
        soloLayerId && root.layers.get(soloLayerId)?.type !== LayerType.Path
    );

    // クリックして選んだ図形の外枠がどこかを決める
    const bounds = useSelectionBounds();

    if (!bounds) {
      return null;
    }

    return (
      <>
        <rect
          className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />
        {/* 外枠のリサイズ用の点 */}
        {isShowingHandles && (
          <>
            {/* 左上 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                // カーソルをresize用の形に変更する
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 真ん中上 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate( ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 右上 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 右真ん中 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 右下 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                // y軸は左上から始まり画面下に進むにつれて「プラス」になるため、+ bounds.heightとなる。
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 真ん中下 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2 + bounds.width / 2}px, ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 左下 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
            {/* 左真ん中 */}
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                // todo: add resize handler
              }}
            />
          </>
        )}
      </>
    );
  }
);

SelectionBox.displayName = "SelectionBox";
