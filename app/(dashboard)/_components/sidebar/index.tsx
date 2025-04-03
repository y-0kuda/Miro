export const Sidebar = () => {
  return (
    // zは重なりの順序を示し、数字が大きい方が前面に出て、数字が小さい方が背面に隠れる
    <aside className="fixed z-[1] left-0 bg-blue-950 h-full w-[60px] flex p-3 flex-col gap-y-4">
      Sidebar
    </aside>
  );
};
