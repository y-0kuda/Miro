export const Toolbar = () => {
  return (
    // -translate-y-[50%]は自分自身の要素の半分だけ縦軸の中心から上に移動する
    // つまり、縦軸の中心から自分自身の要素がちょうど縦に均等になる
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
      <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
        <div>pencil</div>
        <div>circle</div>
      </div>
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <div>redo</div>
        <div>undo</div>
      </div>
    </div>
  );
};

Toolbar.Skeleton = function ToolbarSkeleton() {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md" />
  );
};
