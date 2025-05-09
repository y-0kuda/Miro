"use client";

import { memo } from "react";

import { shallow } from "@liveblocks/client";

import { colorToCss } from "@/lib/utils";
import { useOthersConnectionIds, useOthersMapped } from "@/liveblocks.config";

import { Path } from "./path";
import { Cursor } from "./cursor";

const Cursors = () => {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
};

const Drafts = () => {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow
  );

  return (
    <>
      {others.map(([key, other]) => {
        // もし誰かが何かを描いている途中なら
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              x={0}
              y={0}
              points={other.pencilDraft}
              fill={other.penColor ? colorToCss(other.penColor) : "#000"}
            />
          );
        }

        return null;
      })}
    </>
  );
};

export const CursorsPresence = memo(() => {
  return (
    <>
      <Drafts />
      <Cursors />
    </>
  );
});

// 通常のレンダリングと異なる場合、このようなdisplayNameを入れる
CursorsPresence.displayName = "CursorPresence";
