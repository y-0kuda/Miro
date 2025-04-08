// API Endpoint

import { v } from "convex/values";
import { mutation } from "./_generated/server";

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // 自分自身の情報を取得
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Math.random()で0.0~~から0.9~~の小数を作り、10倍して、imagesの引数としてランダムにimageを取得
    const randomImage = images[Math.floor(Math.random() * images.length)];
    // boardsはschema.tsのschemaを指す
    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      // nameは必ずあるべきものなので!をつける
      // Googleアカウントではなくメールアドレスで登録した場合、nameが空白になるので、代わりにemailを使う
      authorName: identity.name! || identity.email!,
      imageUrl: randomImage,
    });

    return board;
  },
});

export const remove = mutation({
  // convexのboardsテーブルで作成したboardが管理される
  // organizationはclerkで、boardはconvexで管理される
  // このapiでは引数で渡されるidに紐づくデータを削除する
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // todo: delete favorite relations as well

    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: { id: v.id("boards"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const title = args.title.trim();

    if (!title) {
      throw new Error("Title is Required");
    }

    if (title.length > 60) {
      throw new Error("Title cannot be Longer than 60 Characters");
    }

    const board = await ctx.db.patch(args.id, {
      title: args.title,
    });

    return board;
  },
});
