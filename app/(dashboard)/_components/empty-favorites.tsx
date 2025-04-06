import Image from "next/image";

export const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/favorites.svg" height={140} width={140} alt="Favorites" />
      <h2 className="text-2xl font-semibold mt-6">No Favorite Boards Found!</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Add Your Board to Favorites
      </p>
    </div>
  );
};
