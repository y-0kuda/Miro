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
  findIntersectingLayersWithRectangle,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";

import { Info } from "./info";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";

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

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        // point.x: ドラッグをして動かした後の座標
        // canvasState.current.x: ドラッグをして動かす前の座標
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      // 選んだlayerのid
      for (const id of self.presence.selection) {
        // 選んだlayerのidを元にしてlayerの情報を得る
        const layer = liveLayers.get(id);

        // layerがあれば位置を更新
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      // canvas.tsの中でmodeとcurrentという型を決めており、それに従って値を入れている
      // pointは動かした後の座標
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  const unselectedLayers = useMutation(({ self, setMyPresence }) => {
    // layerを選択している状態のとき
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      // toImmutableでliveblocksの保存形式から、javascriptの編集しやすい形に変更される
      const layers = storage.get("layers").toImmutable();
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      // 選択中は、layerIds, layers, originは変わらない
      // onPointerMoveにより、常にcurrentは更新され、それがこの関数に入る
      // 最終的に選択に含まれるlayerのidが返される
      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const startMultilSelection = useCallback((current: Point, origin: Point) => {
    // この値をif文を満たすときに複数選択を始めたとみなす
    // しきい値を設定し、クリックとの区別をする
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

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

      if (canvasState.mode === CanvasMode.Pressing) {
        // current（移動後の座標）とonPointerDownのsetCanvasStateで入った、canvasStateのorigin（移動前の座標）を使用する
        startMultilSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      }
      // onLayerPointerDown()でCanvasMode.Translatingになる
      else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      setMyPresence({ cursor: current });
    },
    [camera, canvasState, translateSelectedLayers, resizeSelectedLayer]
  );

  // カーソルが画面外に出たときに、roomからカーソルを消す
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      // todo: add drawing function

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState]
  );

  // 図形が選択されたときに発火する
  const onPointerUp = useMutation(
    // eslint-disable-next-line
    ({}, e) => {
      // カーソルの位置とカメラの位置でどこに図形を挿入するかを決める
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        // canvasStateはcanvas.tsxで定義したもの
        // CanvasModeはcanvas.tsで定義したもの
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectedLayers();
        setCanvasState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      // historyへの記録を再開する
      history.resume();
    },
    [camera, canvasState, history, unselectedLayers, insertLayer]
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
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      {/* キャンバス内のカーソルの描画や図形の配置等を行う部分 */}
      <svg
        className="h-[100vh] w-[100vh]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
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
          {/* 図形を選択中で、元の座標から移動した移動後の座標がある場合 */}
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                // /5の5の部分の数字が小さいほど、色が濃くなる（黒に近づく）
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                // 始点と終点でより左側にある方
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                // 始点と終点でより上側にある方
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                // 始点と終点の距離
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                // 始点と終点の距離
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
