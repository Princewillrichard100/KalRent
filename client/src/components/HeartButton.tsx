"use client";

import { Heart } from "lucide-react";
import useFavorite from "@/hooks/useFavorite";

interface HeartButtonProps {
  propertyId: number;
  currentUser?: {
    cognitoInfo?: {
      userId?: string;
    };
    userRole?: string;
  } | null;
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  propertyId,
  currentUser,
}) => {
  const { hasFavorited, toggleFavorite } = useFavorite({
    propertyId,
    currentUser,
  });

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      className="
        relative
        hover:scale-110
        transition-transform
        cursor-pointer
        p-1
        rounded-full
        active:scale-95
      "
      aria-label="Save to favorites"
    >
      <Heart
        className={`
          w-7
          h-7
          stroke-[2]
          transition-colors
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]
          ${
            hasFavorited
              ? "fill-rose-500 text-rose-500 stroke-rose-500"
              : "fill-black/35 text-white stroke-white"
          }
        `}
      />
    </button>
  );
};

export default HeartButton;
