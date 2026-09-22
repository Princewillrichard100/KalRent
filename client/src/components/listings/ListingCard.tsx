"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import HeartButton from "@/components/HeartButton";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import { Property } from "@/types/prismaTypes";

interface ListingCardProps {
  data: Property;
  currentUser?: any;
  onAction?: (id: number) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  data,
  currentUser,
  onAction,
  disabled,
  actionLabel,
  actionId = 0,
}) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    data.photoUrls?.[0] || "/placeholder.jpg"
  );

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (disabled) {
      return;
    }

    onAction?.(actionId);
  };

  const totalUpfront =
    (data.annualRent || 0) +
    (data.agentFee || 0) +
    (data.cautionDeposit || 0) +
    (data.platformFee || 0);

  return (
    <div
      onClick={() => router.push(`/search/${data.id}`)}
      className="col-span-1 cursor-pointer group bg-white rounded-2xl p-3 border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col gap-2.5 w-full">
        {/* Image & Heart Button Overlay */}
        <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-slate-100">
          <Image
            fill
            alt={data.name}
            src={imgSrc}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover h-full w-full group-hover:scale-105 transition-all duration-300"
            onError={() => setImgSrc("/placeholder.jpg")}
          />

          <div className="absolute top-2 right-2 z-10">
            <HeartButton propertyId={data.id} currentUser={currentUser} />
          </div>

          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {data.distanceKm !== undefined && (
              <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                <MapPin className="w-2.5 h-2.5 text-rose-400" />
                {data.distanceKm} km
              </span>
            )}
            {data.campusZone && (
              <span className="bg-rose-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                {data.campusZone}
              </span>
            )}
          </div>
        </div>

        {/* Location & Title */}
        <div className="flex justify-between items-start gap-1">
          <div className="font-bold text-sm text-slate-900 truncate tracking-tight">
            {data.name}
          </div>
          <div className="flex items-center gap-1 text-xs shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-800 text-[11px]">
              {data.averageRating ? data.averageRating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        <div className="font-light text-slate-500 text-xs truncate -mt-1">
          {data.landmark ? `${data.landmark}, ` : ""}
          {data.campusZone || data.location?.city || "Ilorin"}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{data.beds} bed</span>
          <span>•</span>
          <span>{data.baths} bath</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" /> Escrow
          </span>
        </div>

        {/* Pricing */}
        <div className="flex flex-row items-baseline gap-1 mt-0.5">
          <div className="font-extrabold text-sm text-slate-900">
            ₦{data.annualRent?.toLocaleString()}
          </div>
          <div className="font-light text-slate-500 text-xs">/ year</div>
        </div>

        {/* Upfront fee tooltip */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] text-slate-500 flex justify-between">
          <span>Total Upfront:</span>
          <span className="font-bold text-slate-800">₦{totalUpfront.toLocaleString()}</span>
        </div>

        {onAction && actionLabel && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleCancel}
            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition disabled:opacity-50 mt-1 cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
