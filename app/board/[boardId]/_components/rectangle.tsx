import { RectangleLayer } from "@/types/canvas";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Rectangle = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) => {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      className="drop-shadow-md"
      // onPointerDownはクリックや画面のタッチで発火する
      onPointerDown={(e) => onPointerDown(e, id)}
      // transformで場所を移動させる
      style={{ transform: `translate(${x}px, ${y}px)` }}
      x={0}
      y={0}
      width={width}
      height={height}
      // ふちどりの太さ
      strokeWidth={1}
      fill="000"
      stroke="transparent"
    />
  );
};
