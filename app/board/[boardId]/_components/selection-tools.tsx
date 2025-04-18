"use client";

import { memo } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

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

    // layerの前後の変更
    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        // number型の空の配列を準備
        const indices: number[] = [];

        const arr = liveLayerIds.toArray();

        // 選択した図形がliveLayerIdsの中で現在何番目かを取得し、indicesに入れる
        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        // indicesに入った図形の0番目から見ていき、liveLayerIdsの中でも0番目にする
        // 0番目にすると一番後ろに配置されることになり、最背面に移動する
        for (let i = 0; i < indices.length; i++) {
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection]
    );

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toArray();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            // 配列の一番最後に移動させることで、最前面に表示される
            arr.length - 1 - (indices.length - 1 - i)
          );
        }
      },
      [selection]
    );

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
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to Front">
            <Button variant="board" size="icon" onClick={moveToFront}>
              <BringToFront />
            </Button>
          </Hint>
          <Hint label="Send to Back" side="bottom">
            <Button variant="board" size="icon" onClick={moveToBack}>
              <SendToBack />
            </Button>
          </Hint>
        </div>
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
