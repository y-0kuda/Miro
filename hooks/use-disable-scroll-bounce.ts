// 相手が大きなスクリーンでペンを使って画面いっぱいに描画しているとき、
// こちらの画面が勝手に動くことがあるのでそれを防ぐためのhook

import { useEffect } from "react";

export const useDisableScrollBounce = () => {
  useEffect(() => {
    // 相手が描いているときはクラスを追加
    document.body.classList.add("overflow-hidden", "overscroll-none");
    return () => {
      // 相手が描き終わったらクラスを削除して元に戻す
      document.body.classList.remove("overflow-hidden", "overscroll-none");
    };
  });
};
