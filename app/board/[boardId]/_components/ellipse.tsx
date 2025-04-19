import { colorToCss } from "@/lib/utils";
import { EllipseLayer } from "@/types/canvas";

interface EllipseLayerProps {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Ellipse = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: EllipseLayerProps) => {
  return (
    // このellipseタグはReactから提供されるもの
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      // translate(x, y) → 要素をx方向にlayer.xピクセル、y方向にlayer.yピクセル移動させる
      style={{ transform: `translate(${layer.x}px, ${layer.y}px)` }}
      // 楕円の中心のx座標とy座標
      cx={layer.width / 2}
      cy={layer.height / 2}
      // 楕円の横半径
      rx={layer.width / 2}
      // 楕円の縦半径
      ry={layer.width / 2}
      fill={layer.fill ? colorToCss(layer.fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth="1"
    />
  );
};
