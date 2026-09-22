"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import HeartButton from "@/components/HeartButton";
import Button from "@/components/Button";
import { Property } from "@/types/prismaTypes";
import { useMarkerHover } from "@/hooks/useMarkerHover";

export interface ListingCardProps {
  data?: (Property & {
    distanceKm?: number;
    distance_km?: number;
    city?: string;
    state?: string;
  }) | null;
  isLoading?: boolean;
  reservation?: any;
  onAction?: (id: string | number) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string | number;
  currentUser?: any;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
  onClick?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  isLoading = false,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
  onMouseEnter,
  onMouseLeave,
  isHovered = false,
  onClick,
}) => {
  const router = useRouter();
  const { highlightMarker, unhighlightMarker } = useMarkerHover();
  const isSkeleton = isLoading || !data;

  const [imgSrc, setImgSrc] = useState(
    data?.photoUrls?.[0] || "/placeholder.jpg"
  );

  const handleMouseEnter = useCallback(() => {
    if (!data?.id) return;
    highlightMarker(data.id);
    onMouseEnter?.();
  }, [highlightMarker, data?.id, onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    if (!data?.id) return;
    unhighlightMarker(data.id);
    onMouseLeave?.();
  }, [unhighlightMarker, data?.id, onMouseLeave]);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [disabled, onAction, actionId]
  );

  const price = useMemo(() => {
    if (!data) return 0;
    if (reservation) return reservation.totalPrice;
    return data.annualRent;
  }, [reservation, data]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }, [reservation]);

  const distanceKm =
    data ? (data.distance_km !== undefined ? data.distance_km : data.distanceKm) : undefined;

  const distanceLabel = useMemo(() => {
    if (!data) return "";
    if (distanceKm !== undefined && distanceKm !== null && !isNaN(distanceKm)) {
      if (distanceKm < 1) return "Under 1 km away";
      return `${distanceKm} km away`;
    }
    const city = data.location?.city || data.city;
    if (city) return `${city}, Nigeria`;
    return data.campusZone ? `${data.campusZone}, Nigeria` : "Nigeria";
  }, [distanceKm, data]);

  const titleHeader = useMemo(() => {
    if (!data) return "";
    let propertyType = (data as any).propertyType || data.category || "Apartment";
    if (propertyType.endsWith("s") && propertyType.toLowerCase() !== "campus") {
      propertyType = propertyType.slice(0, -1);
    }
    const city = data.location?.city || data.city || data.campusZone || "Nigeria";
    return `${propertyType} in ${city}`;
  }, [data]);

  return (
    <div
      id={data?.id ? `listing-card-${data.id}` : undefined}
      onClick={() => {
        if (isSkeleton) return;
        if (onClick) {
          onClick();
        } else if (data?.id) {
          router.push(`/listings/${data.id}`);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`listing-card-item col-span-1 group transition-all duration-150 rounded-2xl p-1.5 -m-1.5 ${
        isSkeleton ? "pointer-events-none cursor-default" : "cursor-pointer"
      } ${isHovered ? "is-hovered" : ""}`}
    >
      <div className="flex flex-col gap-2 w-full">
        {/* 1. Exact locked aspect-square container */}
        <div className="aspect-square w-full relative overflow-hidden rounded-2xl bg-neutral-200/80">
          {isSkeleton ? (
            <div className="w-full h-full animate-pulse bg-neutral-200" />
          ) : (
            <>
              <Image
                fill
                loading="lazy"
                priority={false}
                className="object-cover h-full w-full group-hover:scale-105 transition duration-300"
                src={imgSrc}
                alt={titleHeader || "Listing"}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImgSrc("/placeholder.jpg")}
              />
              <div className="absolute top-3 right-3 z-10">
                <HeartButton
                  propertyId={data.id}
                  currentUser={currentUser}
                />
              </div>
            </>
          )}
        </div>

        {/* 2. Unified Text rows with locked line-height bounds */}
        <div className="flex flex-col gap-1 pt-0.5">
          {/* Row 1: Title & Rating (Locked h-5) */}
          <div className="flex justify-between items-center text-[15px] sm:text-base font-semibold h-5 mt-0.5">
            {isSkeleton ? (
              <>
                <div className="h-4 w-3/5 bg-neutral-200 animate-pulse rounded-md" />
                <div className="h-3.5 w-10 bg-neutral-200 animate-pulse rounded-md" />
              </>
            ) : (
              <>
                <span className="truncate text-neutral-900 leading-none">{titleHeader}</span>
                <span className="flex items-center gap-1 font-normal text-xs text-neutral-800 shrink-0 leading-none ml-2">
                  ★ {data.averageRating ? data.averageRating.toFixed(2) : "4.95"}
                </span>
              </>
            )}
          </div>

          {/* Row 2: Distance subtitle (Locked h-4) */}
          <div className="h-4 text-[14px] sm:text-[15px] text-neutral-500 font-normal flex items-center leading-none">
            {isSkeleton ? (
              <div className="h-3.5 w-2/5 bg-neutral-200 animate-pulse rounded-md" />
            ) : (
              <span className="truncate">{distanceLabel}</span>
            )}
          </div>

          {/* Row 3: Dates / Category subtitle (Locked h-4) */}
          <div className="h-4 text-[14px] sm:text-[15px] text-neutral-500 font-normal flex items-center leading-none">
            {isSkeleton ? (
              <div className="h-3 w-1/3 bg-neutral-200 animate-pulse rounded-md" />
            ) : (
              <span className="truncate">
                {reservationDate || data.category || "Entire Place"}
              </span>
            )}
          </div>

          {/* Row 4: Price line (Locked h-5) */}
          <div className="h-5 text-[15px] sm:text-base flex items-baseline gap-1.5 mt-0.5">
            {isSkeleton ? (
              <div className="h-4 w-1/4 bg-neutral-200 animate-pulse rounded-md" />
            ) : (
              <>
                <span className="font-semibold text-neutral-900 leading-none">
                  ₦ {price?.toLocaleString()}
                </span>
                {!reservation && (
                  <span className="font-normal text-neutral-600 text-xs sm:text-sm leading-none">
                    / year
                  </span>
                )}
              </>
            )}
          </div>

          {onAction && actionLabel && !isSkeleton && (
            <div className="mt-1">
              <Button
                disabled={disabled}
                small
                label={actionLabel}
                onClick={handleCancel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
