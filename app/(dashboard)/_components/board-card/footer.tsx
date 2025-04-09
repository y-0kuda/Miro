import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface FooterProps {
  isFavorite: boolean;
  title: string;
  authorLabel: string;
  createdAtLabel: string;
  onClick: () => void;
  disabled: boolean;
}

export const Footer = ({
  isFavorite,
  title,
  authorLabel,
  createdAtLabel,
  onClick,
  disabled,
}: FooterProps) => {
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    onClick();
  };
  return (
    <div className="relative bg-white p-3">
      {/* -20pxはお気に入りのアイコンを入れるためのスペース */}
      <p className="text-[13px] truncate max-w-[calc(100%-20px)]">{title}</p>
      {/* text-muted-foregroundはテキストのカラーに関するもので、黒ではなく少し灰色っぽい色にする */}
      <p className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-muted-foreground truncate">
        {authorLabel}, {createdAtLabel}
      </p>
      <button
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          // デフォルトでは外枠は元々灰色だが、ホバーすると青くなる
          "opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600",
          disabled && "cursor-not-allowed opacity-75"
        )}
      >
        <Star
          // お気に入りに入れられると外枠だけでなく星の中も青くなる
          className={cn("h-4 w-4", isFavorite && "fill-blue-600 text-blue-600")}
        />
      </button>
    </div>
  );
};
