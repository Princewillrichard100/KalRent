"use client";

import Image from "next/image";
import HeartButton from "@/components/HeartButton";
import { MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface ListingHeadProps {
  title: string;
  imageSrc: string[];
  locationValue: string;
  id: number;
  currentUser?: any;
  campusZone?: string;
}

export const ListingHead: React.FC<ListingHeadProps> = ({
  title,
  imageSrc,
  locationValue,
  id,
  currentUser,
  campusZone,
}) => {
  const [activePhoto, setActivePhoto] = useState(imageSrc[0] || "/placeholder.jpg");
  const photos = imageSrc.length > 0 ? imageSrc : ["/placeholder.jpg"];

  return (
    <div className="space-y-4">
      {/* Title and location header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{locationValue}</span>
            {campusZone && (
              <>
                <span>•</span>
                <span className="font-semibold text-slate-700">{campusZone} Campus Zone</span>
              </>
            )}
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> BaaS Escrow Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <HeartButton propertyId={id} currentUser={currentUser} />
        </div>
      </div>

      {/* Hero photo gallery grid */}
      <div className="w-full h-[350px] sm:h-[420px] md:h-[480px] overflow-hidden rounded-2xl relative grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-100">
        {/* Main large photo */}
        <div className="col-span-1 md:col-span-3 relative h-full w-full overflow-hidden">
          <Image
            alt={title}
            src={activePhoto}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-cover w-full h-full"
            onError={() => setActivePhoto("/placeholder.jpg")}
          />
        </div>

        {/* Thumbnail sidebar for desktop */}
        <div className="hidden md:flex flex-col gap-2 h-full overflow-hidden">
          {photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              onClick={() => setActivePhoto(photo)}
              className={`relative flex-1 w-full overflow-hidden cursor-pointer transition rounded-xl ${
                activePhoto === photo ? "ring-2 ring-rose-500" : "opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                alt={`${title} thumbnail ${index + 1}`}
                src={photo}
                fill
                sizes="25vw"
                className="object-cover"
                onError={(e) => {
                  (e.target as any).src = "/placeholder.jpg";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingHead;
