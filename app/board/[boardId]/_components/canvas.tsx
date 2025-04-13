"use client";

import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStorage, // ユーザーの変更をroom内の他のユーザーに知らせるためのhooks
} from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
} from "@/types/canvas";
import { pointerEventToCanvasPoint } from "@/lib/utils";

import { Info } from "./info";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // rootにはroomに関する様々な情報（layer, width, heightなど）があり、その中のlayerIdsを取得
  const layerIds = useStorage((root) => root.layerIds);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    // デフォルトはblack
    r: 0,
    g: 0,
    b: 0,
  });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // useMutationはliveblocksのhooksでこの値を受け取って別の値を返す
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Text
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Ellipse,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      // 新しく追加するlayerのidを生成
      const layerId = nanoid();
      // layerの型を定義
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      // layerのidの中に新しいlayerのidを追加
      liveLayerIds.push(layerId);
      // idと共に新しいlayerを追加
      liveLayers.set(layerId, layer);

      // selectionで新しく追加した図形が選択された状態にする
      // addToHistoryでundo, redoができるようにする
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      // 一つの図形を追加したらアクションはpointerに戻る
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  // カーソルの動きに合わせてカメラ（roomの中心の点）も変更する
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  // 現在の場所とカーソルの動く先を渡して、新たな場所を記録する
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera);

      setMyPresence({ cursor: current });
    },
    []
  );

  // カーソルが画面外に出たときに、roomからカーソルを消す
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  // 図形が選択されたときに発火する
  const onPointerUp = useMutation(
    ({}, e) => {
      // カーソルの位置とカメラの位置でどこに図形を挿入するかを決める
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      // histroyへの記録を再開する
      history.resume();
    },
    [camera, canvasState, history, insertLayer]
  );

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
      {/* キャンバス内のカーソルの描画や図形の配置等を行う部分 */}
      <svg
        className="h-[100vh] w-[100vh]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
      >
        {/* 動的に表示を変更する際に使われる */}
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={() => {}}
              // 他の人が編集しているのがわかるように使われる色
              selectionColor="#000"
            />
          ))}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
