"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { api } from "@/convex/_generated/api";
import { Actions } from "@/components/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiMutation } from "@/hooks/use-api-mutation";

import { Overlay } from "./overlay";
import { Footer } from "./footer";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  title,
  authorName,
  authorId,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) => {
  // 自分自身の情報を取得する
  const { userId } = useAuth();

  // 自分のidがboardを作った人のidと一致すればYouと表示され、一致しなければ作った人のauthrorNameが表示される
  const authorLabel = userId === authorId ? "You" : authorName;

  // 3 minutes agoや2 hours agoのように今からどれくらい時間が経ったかを表示する
  // addSuffixをtrueにすると、agoがつく
  const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });

  const { mutate: onFavorite, pending: pendingFavorite } = useApiMutation(
    api.board.favorite
  );

  const { mutate: onUnFavorite, pending: pendingUnFavorite } = useApiMutation(
    api.board.unfavorite
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      // boardのidがあれば、favoriteから外せる
      onUnFavorite({ id }).catch(() => toast.error("Failed to Add Favorites"));
    } else {
      // orgのIdとboardのidがあれば、favoriteに追加できる
      onFavorite({ id, orgId }).catch(() =>
        toast.error("Failed to Remove from Favorites")
      );
    }
  };

  return (
    <Link href={`/board/${id}`}>
      {/* groupがあてられているため、Overlayに含まれるgroup-hoverが適用されて大きなdivのくくりでデザインが適応される、 */}
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <Image src={imageUrl} alt={title} fill className="object-fit p-4" />
          <Overlay />
          <Actions id={id} title={title} side="right">
            {/* outline-noneはと外枠を透明にする */}
            <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
              {/* 三点のボタンが見えるようになったとき、デフォルトではopacity-75だが、ホバーするとopacity-100で色が濃くなる */}
              <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
            </button>
          </Actions>
        </div>
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavorite}
          disabled={pendingFavorite || pendingUnFavorite}
        />
      </div>
    </Link>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
