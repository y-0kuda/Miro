"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const font = Poppins({
  // フォントにはたくさんの言語が含まれるが、ここではlatin語（アルファベット）を使えるようにする
  // latinに含まれていない言語は読み込みの時間に差は出るが使える
  subsets: ["latin"],
  weight: ["600"],
});

export const OrgSideBar = () => {
  // URLのパラメーターを取得する
  const searchParams = useSearchParams();
  // パラメーターにfavoritesがあればtrue、なければfalse
  const favorites = searchParams.get("favorites");

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image src="/logo.svg" alt="logo" height={60} width={60} />
          {/* 特別なフォントを適応するためにあえて初期値と追加の値を設定している */}
          <span className={cn("font-semibold text-2xl", font.className)}>
            Miro
          </span>
        </div>
      </Link>
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            rootBox: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },
            organizationSwitcherTrigger: {
              // 要素内の外枠にゆとりを持たせ、文字を中に寄せるとともに枠自体を大きくする
              padding: "6px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              justifyContent: "space-between",
              backgroundColor: "white",
            },
          },
        }}
      />
      <div className="space-y-1 w-full">
        <Button
          // defalutではghost（薄い白）で、下のFavorite Boardsがクリックされればsecondaryで透明になる
          variant={favorites ? "ghost" : "secondary"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link href="/">
            <LayoutDashboard className="h-4 w-5 mr-2" />
            Team Boards
          </Link>
        </Button>
        <Button
          variant={favorites ? "secondary" : "ghost"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link
            // /?favorites=trueに遷移する
            href={{
              pathname: "/",
              query: { favorites: true },
            }}
          >
            <Star className="h-4 w-5 mr-2" />
            Favorite Boards
          </Link>
        </Button>
      </div>
    </div>
  );
};
