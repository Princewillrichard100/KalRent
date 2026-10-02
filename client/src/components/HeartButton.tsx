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
      aria-pressed={hasFavorited}
      aria-label={hasFavorited ? "Remove from favorites" : "Save to favorites"}
      className="
        relative
        hover:scale-110
        transition-transform
        cursor-pointer
        p-1
        rounded-full
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
      "
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
              ? "fill-primary text-primary stroke-primary"
              : "fill-black/35 text-white stroke-white"
          }
        `}
      />
    </button>
  );
};

export default HeartButton;
