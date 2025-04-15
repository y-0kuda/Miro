"use client";

import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";
import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStorage,
  useOthersMapped, // ユーザーの変更をroom内の他のユーザーに知らせるためのhooks
} from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";
import {
  connectionIdToColor,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";

import { Info } from "./info";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // rootにはroomに関する様々な情報（layer, width, heightなど）があり、その中のlayerIdsを取得
  const layerIds = useStorage((root) => root.layerIds);

  // setCanvasStateはオブジェクトを受け付ける
  // ({})となっており、中にはいる情報は一つではない
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

  const resizeSelectedLayer = useMutation(
    // pointはonPointerMoveの中でcurrentを入れるのに使う。
    ({ storage, self }, point: Point) => {
      // リサイズではないとき
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  // 図形の枠のリサイズ部分をクリックしたとき
  const onResizeHandlePointerDown = useCallback(
    // このファイルからselection-box.tsxにはcorner, initialBoundsという型が決まった変数のみ渡す
    (corner: Side, initialBounds: XYWH) => {
      // リサイズ中はhistoryに追加しない
      history.pause();
      // setCanvasStateは「オブジェクト」を格納する
      // modeだけを受け付けるわけではない
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
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

      if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      setMyPresence({ cursor: current });
    },
    [camera, canvasState, resizeSelectedLayer]
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

      // historyへの記録を再開する
      history.resume();
    },
    [camera, canvasState, history, insertLayer]
  );

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      // 何か図形を入力しているときかペンで描画しているときはこの関数は発火しない
      if (
        canvasState.mode === CanvasMode.Inserting ||
        canvasState.mode === CanvasMode.Pencil
      ) {
        return;
      }

      // 図形の選択のundo, redoはできないようにする
      history.pause();
      e.stopPropagation();

      // カメラの位置とカーソルの位置を比較して現在のポインタの場所を取得
      const point = pointerEventToCanvasPoint(e, camera);

      // クリックしたlayerがselectionに含まれていない場合
      if (!self.presence.selection.includes(layerId)) {
        // そのlayerをselectionに加え、undo, redoできるようにする
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      // Translating（動かす）モードに設定する
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );

  // 誰が編集をしているかを分かるようにする
  // selectionはliveblocks.config.tsに定義されている
  const selections = useOthersMapped((other) => other.presence.selection);

  const layerIdsToColorSelection = useMemo(() => {
    // Recordはtypescriptから提供されている、オブジェクトのキーと値の型を指定するための型
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        // layerIdに紐づいた色をRecord型に入れる
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

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
              onLayerPointerDown={onLayerPointerDown}
              // 他の人が編集しているのがわかるように使われる色
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          {/* 自分で選んだ図形に外枠をつける */}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
