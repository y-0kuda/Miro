import { Info } from "./info";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  return (
    // ブロックが白なので、背景に少し色を足すためにbg-neutral-100を追加する
    // touch-noneはブラウザの上下のスクロールを無効にし、スクロールを自作できるようにする
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar />
    </main>
  );
};
