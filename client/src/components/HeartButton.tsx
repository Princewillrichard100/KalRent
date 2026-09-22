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
        hover:opacity-80
        transition
        cursor-pointer
        p-1.5
        rounded-full
        active:scale-90
      "
      aria-label="Save to favorites"
    >
      <Heart
        className="
          w-6 
          h-6 
          text-white 
          drop-shadow-md 
          absolute 
          -top-[2px] 
          -right-[2px]
        "
        strokeWidth={1.5}
      />
      <Heart
        className={`
          w-5 
          h-5 
          transition-colors
          ${hasFavorited ? "fill-rose-500 text-rose-500" : "fill-neutral-500/50 text-white"}
        `}
      />
    </button>
  );
};

export default HeartButton;
