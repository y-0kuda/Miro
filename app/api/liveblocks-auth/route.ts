import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// このファイルだけで、liveblocks, clerk, convexが使われている
export async function POST(request: Request) {
  const authorization = await auth();
  const user = await currentUser();

  // clerkのログイン認証を通過しているか、userがそもそも現在いるか
  if (!authorization || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  // 入ろうとしているroomの情報がliveblocksから返ってくる
  const { room } = await request.json();

  // liveclocksのroomのidを使って、convexの中で同じidのデータがあるかを調べ、あればデータ取得
  const board = await convex.query(api.board.get, { id: room });

  if (board?.orgId !== authorization.orgId) {
    return new Response("Unauthorized", { status: 403 });
  }

  const userEmailInfo = user.emailAddresses;
  const userEmail = userEmailInfo[0]?.emailAddress;

  // clerkを使って現在ログインしているユーザーの情報を取得
  const userInfo = {
    name: user.firstName || userEmail,
    picture: user.imageUrl!,
  };

  // ユーザー情報を使ってliveblocksでsessionを作成
  const session = liveblocks.prepareSession(user.id, { userInfo });

  // sessionにアクセス権限を追加
  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  // sessionを元にliveblocksの関数のauthorize()を使って認証をする
  // statusとその他の内容が返る
  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
