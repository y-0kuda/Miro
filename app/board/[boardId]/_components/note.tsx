import { useEffect, useRef, useState } from "react";
import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { NoteLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Note = ({
  layer,
  onPointerDown,
  id,
  selectionColor,
}: NoteProps) => {
  const { x, y, width, height, fill, value } = layer;

  // 参照を保持
  const contentRef = useRef<HTMLDivElement>(null);

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");
    liveLayers.get(id)?.set("value", newValue);
  }, []);

  const [fontSize, setFontSize] = useState(12);

  // テキストが要素内に収まるようにフォントサイズを調整（大きく・小さく）
  const adjustFontSizeToFit = () => {
    // div要素がelに入る
    const el = contentRef.current;
    if (!el) return;
    
    // 最大サイズは要素に比例
    const maxFontSize = Math.min(width, height) * 0.4; 
    let newFontSize = 8;

    el.style.fontSize = `${newFontSize}px`;

    // 少しずつフォントサイズを上げながら収まるか確認
    while (
      newFontSize < maxFontSize &&
      // scrollHeightは文字の見えない部分を含めての高さ
      // clientHeightは見えている枠の高さ
      el.scrollHeight <= el.clientHeight &&
      el.scrollWidth <= el.clientWidth
    ) {
      newFontSize += 1;
      el.style.fontSize = `${newFontSize}px`;
    }

    // 最後に1増やしたときにオーバーしている可能性があるので戻す
    newFontSize -= 1;
    el.style.fontSize = `${newFontSize}px`;

    setFontSize(newFontSize);
  };

  // テキスト変更時
  const handleContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
    // updateValueが終わった後にadjustFontSizeToFitを行うためにsetTimeoutを入れている
    setTimeout(adjustFontSizeToFit, 0);
  };

  // 初期表示＆サイズ・テキスト変化時にフォント再調整
  useEffect(() => {
    setTimeout(adjustFontSizeToFit, 0);
  }, [value, width, height]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      // ブラウザのデフォルト改行を防ぐ
      e.preventDefault();
      // <br> を挿入する
      document.execCommand("insertLineBreak"); 
    }
  };
  
  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      }}
      className="shadow-md drop-shadow-xl"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: fill ? colorToCss(fill) : "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ContentEditable
          html={value || ""}
          onChange={handleContentChange}
          innerRef={contentRef}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full h-full p-2 text-center whitespace-pre-wrap break-words outline-none",
            font.className
          )}
          style={{
            fontSize: `${fontSize}px`,
            color: fill ? getContrastingTextColor(fill) : "#000",
            // はみ出し検出のため
            overflow: "hidden", 
          }}
        />
      </div>
    </foreignObject>
  );
};
