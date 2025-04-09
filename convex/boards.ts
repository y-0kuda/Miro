import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";
import { query } from "./_generated/server";

export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Favorite Boardsが押されたとき
    if (args.favorites) {
      // userFavoritesテーブルからOrg内のそのuserがお気に入りに入れているboardを取り出す
      const favoriteBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identity.subject).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();

      // Org内の自分のお気に入りboardのidをまとめて取得する
      const ids = favoriteBoards.map((b) => b.boardId);

      const boards = await getAllOrThrow(ctx.db, ids);

      return boards.map((board) => ({
        ...board,
        // Org内の自分のお気に入りboardのisFavoriteをtrueにする
        isFavorite: true,
      }));
    }

    // args内のseachとして渡される値
    const title = args.search as string;
    let boards = [];

    if (title) {
      // 検索窓で特定のboardsを取得する場合
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect();
    } else {
      // 全部とってくる場合
      boards = await ctx.db
        .query("boards")
        // organization（boardsより大きい括り）で現在のorganizationで作成したboardsの一覧を取得
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect();
    }

    const boardsWithFavoriteRelation = boards.map((board) => {
      return (
        ctx.db
          .query("userFavorites")
          .withIndex("by_user_board", (q) =>
            q.eq("userId", identity.subject).eq("boardId", board._id)
          )
          .unique()
          // userFavoritesテーブルの中で、userIdとboardIdが一致するデータを一つとってくる
          // もしデータがあれば、そのboardのisFavoriteをtrueにし、なければfalseとする
          .then((favorite) => {
            return {
              ...board,
              // !!favoriteはtrue/falseを得るための手法
              // favoriteがnullであればfalseが返る
              // favoriteに値があればtrueが返る
              // このisFavoriteはお気に入りの操作（マークの動的な変化やDBへの操作）に使われる（ex: board-list.tsx）
              // boardsテーブルとuserFavoritesテーブルが結びついてisFavoriteがコンポーネントで使われる
              isFavorite: !!favorite,
            };
          })
      );
    });

    // favoriteを関連させた状態を作成する
    const boardsWithFavoriteBoolean = Promise.all(boardsWithFavoriteRelation);

    return boardsWithFavoriteBoolean;
  },
});
