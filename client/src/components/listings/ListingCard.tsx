"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import HeartButton from "@/components/HeartButton";
import Button from "@/components/Button";
import { Property } from "@/types/prismaTypes";

interface ListingCardProps {
  data: Property;
  reservation?: any;
  onAction?: (id: string | number) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string | number;
  currentUser?: any;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
}) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    data.photoUrls?.[0] || "/placeholder.jpg"
  );

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (disabled) {
      return;
    }

    onAction?.(actionId);
  }, [disabled, onAction, actionId]);

  const price = useMemo(() => {
    if (reservation) {
      return reservation.totalPrice;
    }

    return data.annualRent;
  }, [reservation, data.annualRent]);

  const reservationDate = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }, [reservation]);

  return (
    <div 
      onClick={() => router.push(`/listings/${data.id}`)} 
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div 
          className="
            aspect-square 
            w-full 
            relative 
            overflow-hidden 
            rounded-xl
          "
        >
          <Image
            fill
            className="
              object-cover 
              h-full 
              w-full 
              group-hover:scale-110 
              transition
            "
            src={imgSrc}
            alt="Listing"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="
            absolute
            top-3
            right-3
          ">
            <HeartButton 
              propertyId={data.id} 
              currentUser={currentUser}
            />
          </div>
        </div>
        <div className="font-semibold text-lg">
          {data.campusZone || data.location?.city || "Ilorin"}, {data.location?.country || "Nigeria"}
        </div>
        <div className="font-light text-neutral-500">
          {reservationDate || data.category || "Student Accommodation"}
        </div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">
            ₦ {price?.toLocaleString()}
          </div>
          {!reservation && (
            <div className="font-light">year</div>
          )}
        </div>
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel} 
            onClick={handleCancel}
          />
        )}
      </div>
    </div>
   );
}
 
export default ListingCard;
