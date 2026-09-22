import { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import {
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetTenantQuery,
} from "@/state/api";
import { useLoginModal } from "./useLoginModal";

interface IUseFavorite {
  propertyId: number;
  currentUser?: {
    cognitoInfo?: {
      userId?: string;
    };
    userRole?: string;
  } | null;
}

export const useFavorite = ({ propertyId, currentUser }: IUseFavorite) => {
  const loginModal = useLoginModal();
  const userId = currentUser?.cognitoInfo?.userId;

  const { data: tenant } = useGetTenantQuery(userId || "", {
    skip: !userId,
  });

  const [addFavoriteProperty] = useAddFavoritePropertyMutation();
  const [removeFavoriteProperty] = useRemoveFavoritePropertyMutation();

  const isFavoritedFromData = useMemo(() => {
    const list = tenant?.favorites || [];
    return list.some((item: { id: number }) => item.id === propertyId);
  }, [tenant?.favorites, propertyId]);

  const [hasFavorited, setHasFavorited] = useState(isFavoritedFromData);

  useEffect(() => {
    setHasFavorited(isFavoritedFromData);
  }, [isFavoritedFromData]);

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.stopPropagation();

      if (!currentUser || !userId) {
        return loginModal.onOpen();
      }

      // Optimistic update
      const previousState = hasFavorited;
      setHasFavorited(!previousState);

      try {
        if (previousState) {
          await removeFavoriteProperty({
            cognitoId: userId,
            propertyId,
          }).unwrap();
          toast.success("Removed from saved hostels");
        } else {
          await addFavoriteProperty({
            cognitoId: userId,
            propertyId,
          }).unwrap();
          toast.success("Saved to your wishlist");
        }
      } catch (error) {
        // Rollback on error
        setHasFavorited(previousState);
        toast.error("Something went wrong updating favorites");
      }
    },
    [
      currentUser,
      userId,
      hasFavorited,
      propertyId,
      loginModal,
      addFavoriteProperty,
      removeFavoriteProperty,
    ]
  );

  return {
    hasFavorited,
    toggleFavorite,
  };
};

export default useFavorite;
