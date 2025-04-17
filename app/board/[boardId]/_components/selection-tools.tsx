"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Camera, Color } from "@/types/canvas";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

import { ColorPicker } from "./color-picker";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    // 選択した図形
    const selection = useSelf((me) => me.presence.selection);

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        // 最後に使用した色を最後に選択した色と合わせる
        setLastUsedColor(fill);

        // 選択した図形と全ての図形を比較してidが同じものを探す
        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const deleteLayers = useDeleteLayers();

    // 外枠を作る関数
    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
      return null;
    }

    // x軸の真ん中
    // 図形の左端に図形の横幅の半分の大きさを足し、カメラ（中心位置）からの距離をたす（マイナスにもなりうる）
    const x = selectionBounds.x + selectionBounds.width / 2 + +camera.x;
    // y軸の真ん中
    // 図形の上端にカメラからの距離をたす
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-one"
        style={{
          // x: ツールバー自体の幅を左に半分ずらして、ツールバーが横方向に真ん中に来るようにする
          // y:
          transform: `translate(
          calc(${x}px - 50%),
          calc(${y - 16}px - 100%)
        )`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Delete">
            <Button variant="board" size="icon" onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
