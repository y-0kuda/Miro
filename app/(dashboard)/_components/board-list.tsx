"use client";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

export const BoardList = ({ query }: BoardListProps) => {
  const data = []; // todo: change to api call

  // 検索バーで探したが見つからなかったとき
  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  // Favorite Boradsをクリックしたが、お気に入りがなかったとき
  if (!data?.length && query.favorites) {
    return <EmptyFavorites />;
  }

  // boardがないとき
  if (!data?.length) {
    return <EmptyBoards />;
  }

  return <div>{JSON.stringify(query)}</div>;
};
