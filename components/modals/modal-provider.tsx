"use client";

import { useEffect, useState } from "react";

import { RenameModal } from "./rename-modal";

// hydration errorを防ぐために使われる
// サーバーサイドのレンダリングが終わっていない間はモーダルは表示させない
// app/layout.tsxに追記する
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <RenameModal />
    </>
  );
};
