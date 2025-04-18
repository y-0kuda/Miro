"use client";

import { memo } from "react";

import { LayerType } from "@/types/canvas";
import { useStorage } from "@/liveblocks.config";

import { Rectangle } from "./rectangle";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    // layerがstorageに存在するか確認
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) {
      return null;
    }

    switch (layer.type) {
      case LayerType.Text:
        return <div>text</div>;
      case LayerType.Note:
        return <div>note</div>;
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Ellipse:
        return <div>Ellipse</div>;
      default:
        console.warn("unknown type error");
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
