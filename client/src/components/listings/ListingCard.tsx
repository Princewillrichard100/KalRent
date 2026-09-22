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

  const subtitleSpecs = useMemo(() => {
    if (!data) return "";
    const parts: string[] = [];
    if (data.beds) parts.push(`${data.beds} ${data.beds === 1 ? "bedroom" : "bedrooms"}`);
    if (data.baths) parts.push(`${data.baths} ${data.baths === 1 ? "bath" : "baths"}`);
    if (distanceKm !== undefined && distanceKm !== null && !isNaN(distanceKm)) {
      parts.push(distanceKm < 1 ? "Under 1 km away" : `${distanceKm} km away`);
    }
    return parts.join(" · ") || distanceLabel;
  }, [data, distanceKm, distanceLabel]);

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
        {/* 1. Exact locked aspect-[20/19] container */}
        <div className="aspect-[20/19] w-full relative overflow-hidden rounded-2xl bg-neutral-200/80">
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
        <div className="flex flex-col gap-0.5 pt-0.5">
          {/* Row 1: Title & Rating on one baseline (Locked h-5) */}
          <div className="flex justify-between items-center h-5">
            {isSkeleton ? (
              <>
                <div className="h-3.5 w-3/5 bg-neutral-200 animate-pulse rounded" />
                <div className="h-3.5 w-10 bg-neutral-200 animate-pulse rounded" />
              </>
            ) : (
              <>
                <span className="font-semibold text-neutral-900 text-sm truncate">{titleHeader}</span>
                <span className="text-xs text-neutral-800 shrink-0 ml-2 font-normal flex items-center gap-0.5">
                  ★ {data.averageRating ? Number(data.averageRating).toFixed(2) : "4.84"}{" "}
                  <span className="text-neutral-500 font-normal">
                    ({data.numberOfReviews || 18})
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Row 2: Subtitle 1 - Specs / Distance (Locked h-4) */}
          <div className="h-4 text-xs text-neutral-500 font-normal flex items-center leading-none">
            {isSkeleton ? (
              <div className="h-3 w-2/5 bg-neutral-200 animate-pulse rounded" />
            ) : (
              <span className="truncate">{subtitleSpecs}</span>
            )}
          </div>

          {/* Row 3: Subtitle 2 - Dates window / Availability (Locked h-4) */}
          <div className="h-4 text-xs text-neutral-500 font-normal flex items-center leading-none">
            {isSkeleton ? (
              <div className="h-3 w-1/3 bg-neutral-200 animate-pulse rounded" />
            ) : (
              <span className="truncate">
                {reservationDate || "Flexible move-in"}
              </span>
            )}
          </div>

          {/* Row 4: Bold Price line (Locked h-5) */}
          <div className="h-5 text-sm flex items-center gap-1 pt-0.5">
            {isSkeleton ? (
              <div className="h-3.5 w-1/4 bg-neutral-200 animate-pulse rounded" />
            ) : (
              <>
                <span className="font-semibold text-neutral-900 leading-none">
                  ₦{price?.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-600 font-normal leading-none">
                  {reservation ? "total" : "/ year"}
                </span>
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
