import { shallow } from "@liveblocks/react";

import { Layer, XYWH } from "@/types/canvas";
import { useStorage, useSelf } from "@/liveblocks.config";

const boundingBox = (layers: Layer[]): XYWH | null => {
  // layersは引数として渡される
  const first = layers[0];

  if (!first) {
    return null;
  }

  // ブラウザの左上始まりをイメージする
  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  // 上記でleft, right, top, bottomの仮を決め、ここで選択した外枠に更新
  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) {
      left = x;
    }

    if (right < x + width) {
      right = x + width;
    }

    if (top > y) {
      top = y;
    }

    if (bottom < y + height) {
      bottom = y + height;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

// 外枠を作る
export const useSelectionBounds = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    const selectedLayers = selection
      .map((layerId) => root.layers.get(layerId)!)
      // trueのもの（選択されたもの）だけがselectedLayersに入るようにする
      // selectedLayersと複数形だが一つだけlayerが入ることもある
      .filter(Boolean);

    return boundingBox(selectedLayers);
    // 表層的な情報だけでこのuseStorageを実行するようにする
  }, shallow);
};
