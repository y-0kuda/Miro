"use client";

import { Plus } from "lucide-react";
import { CreateOrganization } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Hint } from "@/components/hint";

export const NewButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="aspect-square">
          <Hint
            label="Create Organization"
            // 要素の右側の上部に表示
            // side（左側）に18pxの空白を入れる
            side="right"
            align="start"
            sideOffset={18}
          >
            {/* bg-white/25は25%の透明度（100%が一番濃い）の背景が設定される */}
            {/* プラスのアイコンが少しかすんでいるのはopacityの影響で、bg-whiteは関係ない */}
            <button className="bg-white/25 h-full w-full rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition">
              <Plus className="text-white" />
            </button>
          </Hint>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none max-w-[500px]">
        <CreateOrganization />
        <DialogTitle className="sr-only">Title</DialogTitle>
        <DialogDescription className="sr-only">Description</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
