"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import HeartButton from "@/components/HeartButton";
import Button from "@/components/Button";
import { Property } from "@/types/prismaTypes";

interface ListingCardProps {
  data: Property & {
    distanceKm?: number;
    distance_km?: number;
    city?: string;
    state?: string;
  };
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
    },
    [disabled, onAction, actionId]
  );

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

  const distanceKm =
    data.distance_km !== undefined ? data.distance_km : data.distanceKm;

  const distanceLabel = useMemo(() => {
    if (distanceKm !== undefined && distanceKm !== null && !isNaN(distanceKm)) {
      if (distanceKm < 1) {
        return "Under 1 km away";
      }
      return `${distanceKm} km away`;
    }
    const city = data.location?.city || data.city;
    if (city) {
      return `${city}, Nigeria`;
    }
    return data.campusZone ? `${data.campusZone}, Nigeria` : "Nigeria";
  }, [distanceKm, data.location, data.city, data.campusZone]);

  const titleHeader = useMemo(() => {
    if (data.name) return data.name;
    const city = data.location?.city || data.city;
    const state = data.location?.state || data.state;
    if (city && state) return `${city}, ${state}`;
    return city || data.campusZone || "Stunning Rental";
  }, [data.name, data.location, data.city, data.state, data.campusZone]);

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        {/* 1. Rounded image container with Heart toggle */}
        <div
          className="
            aspect-square 
            w-full 
            relative 
            overflow-hidden 
            rounded-2xl
          "
        >
          <Image
            fill
            className="
              object-cover 
              h-full 
              w-full 
              group-hover:scale-105 
              transition 
              duration-300
            "
            src={imgSrc}
            alt="Listing"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div
            className="
              absolute
              top-3
              right-3
            "
          >
            <HeartButton
              propertyId={data.id}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* 2. Title / City bold header */}
        <div className="font-semibold text-[15px] sm:text-base text-neutral-900 truncate mt-1">
          {titleHeader}
        </div>

        {/* 3. Distance subtitle */}
        <div className="text-neutral-500 text-[14px] sm:text-[15px] font-normal leading-tight">
          {distanceLabel}
        </div>

        {/* 4. Available dates / category subtitle */}
        <div className="text-neutral-500 text-[14px] sm:text-[15px] font-normal truncate leading-tight">
          {reservationDate || data.category || "Entire Place"}
        </div>

        {/* 5. Price line */}
        <div className="flex flex-row items-baseline gap-1.5 mt-1">
          <span className="font-semibold text-[15px] sm:text-base text-neutral-900">
            ₦ {price?.toLocaleString()}
          </span>
          {!reservation && (
            <span className="font-normal text-neutral-600 text-sm">/ year</span>
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
