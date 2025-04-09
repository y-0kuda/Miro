"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useApiMutation } from "@/hooks/use-api-mutation";

import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface NewBoardButtonProps {
  orgId: string;
  disabled?: boolean;
}

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
  const router = useRouter();
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = () => {
    mutate({
      orgId,
      title: "untitled",
    })
      .then((id) => {
        toast.success("Board Created");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to Create Board"));
  };

  return (
    <button
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        // items-centerで横方向に中央寄せ
        // justify-centerで縦方向に中央寄せ
        "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
        (pending || disabled) && "opacity-75 hover:bg-blue-600"
      )}
    >
      {/* スペース用 */}
      <div />
      {/* stroke-1は細くする */}
      <Plus className="h-12 w-12 text-white stroke-1" />
      {/* font-lightは細くする */}
      <p className="text-xs text-white font-light">New Board</p>
    </button>
  );
};
