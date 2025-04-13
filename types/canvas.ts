export type Color = {
  r: number;
  g: number;
  b: number;
};

// 画面を動かした際に使う座標
export type Camera = {
  x: number;
  y: number;
};

export enum LayerType {
  Text,
  Note,
  Rectangle,
  Ellipse,
  Path,
}

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type Note = {
  type: LayerType.Note;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

// ペン
export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  points: number[][];
  value?: string;
};

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.Pressing;
      // どこで押したか情報が必要
      origin: Point;
    }
  | {
      mode: CanvasMode.SelectionNet;
      // 範囲を選択する際にどこからどこまでという数値が必要になる
      // originがどこからでcurrentがどこまでを指す
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType:
        | LayerType.Text
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Ellipse;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Pencil;
    };

// enumerations: specifically listed
export enum CanvasMode {
  None,
  Pressing, // 押す動作
  SelectionNet, // 複数選択
  Translating, // 動かす
  Inserting, // 挿入
  Resizing, // 変形
  Pencil, // ペン
}
