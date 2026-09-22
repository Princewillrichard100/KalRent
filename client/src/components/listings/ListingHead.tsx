"use client";

import Image from "next/image";
import HeartButton from "@/components/HeartButton";
import { MapPin, Share, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const rawPhotos = imageSrc.length > 0 ? imageSrc : ["/placeholder.jpg"];
  // Ensure we have at least 5 photos for the canonical 5-photo Airbnb grid
  const photos = [
    rawPhotos[0],
    rawPhotos[1] || rawPhotos[0],
    rawPhotos[2] || rawPhotos[0],
    rawPhotos[3] || rawPhotos[1] || rawPhotos[0],
    rawPhotos[4] || rawPhotos[2] || rawPhotos[0],
  ];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="underline cursor-pointer">{locationValue}</span>
            {campusZone && (
              <>
                <span>•</span>
                <span className="font-semibold text-neutral-800">{campusZone} Campus Zone</span>
              </>
            )}
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> BaaS Escrow Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 p-2 rounded-lg transition cursor-pointer"
          >
            <Share className="w-4 h-4" />
            <span className="underline">Share</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition">
            <HeartButton propertyId={id} currentUser={currentUser} />
            <span className="underline cursor-pointer">Save</span>
          </div>
        </div>
      </div>

      {/* Canonical Airbnb 5-Photo Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[350px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden relative bg-neutral-100">
        {/* Large Primary Hero Photo (Left - 2 cols, 2 rows) */}
        <div
          onClick={() => setSelectedPhoto(photos[0])}
          className="col-span-1 md:col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
        >
          <Image
            fill
            alt={`${title} - Photo 1`}
            src={photos[0]}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as any).src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Quadrant 2 (Top Middle) */}
        <div
          onClick={() => setSelectedPhoto(photos[1])}
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer group"
        >
          <Image
            fill
            alt={`${title} - Photo 2`}
            src={photos[1]}
            sizes="25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as any).src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Quadrant 3 (Top Right) */}
        <div
          onClick={() => setSelectedPhoto(photos[2])}
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer group"
        >
          <Image
            fill
            alt={`${title} - Photo 3`}
            src={photos[2]}
            sizes="25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as any).src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Quadrant 4 (Bottom Middle) */}
        <div
          onClick={() => setSelectedPhoto(photos[3])}
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer group"
        >
          <Image
            fill
            alt={`${title} - Photo 4`}
            src={photos[3]}
            sizes="25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as any).src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Quadrant 5 (Bottom Right) */}
        <div
          onClick={() => setSelectedPhoto(photos[4])}
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden cursor-pointer group"
        >
          <Image
            fill
            alt={`${title} - Photo 5`}
            src={photos[4]}
            sizes="25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as any).src = "/placeholder.jpg";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ListingHead;
