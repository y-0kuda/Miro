"use client";

import { toast } from "sonner";
import { Link2, Pencil, Trash2 } from "lucide-react";

import { Button } from "./ui/button";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ConfirmModal } from "./confirm-modal";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
  children: React.ReactNode;
  // sideはドロップダウンを開くボタンに対してドロップダウンが上下左右のどこに表示されるかを決める
  side?: DropdownMenuContentProps["side"];
  // sideOffsetはボタンに対してどれくらいの距離にドロップダウンが表示されるかを決める
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: string;
  title: string;
}

export const Actions = ({
  children,
  side,
  sideOffset,
  id,
  title,
}: ActionProps) => {
  const { onOpen } = useRenameModal();
  const { mutate, pending } = useApiMutation(api.board.remove);
  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => toast.success("Link Copied"))
      .catch(() => toast.error("Failed to Copy Link"));
  };
  const onDelete = () => {
    mutate({ id })
      .then(() => toast.success("Board Deleted"))
      .catch(() => toast.error("Failed to Delete Board"));
  };

  return (
    // ボタンはTrigger内のchild（board-card/index.tsx）で作成
    // ボタンを押した後のメニューはContentで作成
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        // もしstopPropagationがなければboardが開いてしまう
        // 親要素にクリックが伝播しないようにする
        onClick={(e) => e.stopPropagation()}
        side={side}
        sideOffset={sideOffset}
        className="w-60"
      >
        <DropdownMenuItem className="p-3 cursor-pointer" onClick={onCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy Board Link
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-3 cursor-pointer"
          onClick={() => onOpen(id, title)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Board Title
        </DropdownMenuItem>
        <ConfirmModal
          header="Delete Board?"
          description="This will detele board and its related data."
          disabled={pending}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Board
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
