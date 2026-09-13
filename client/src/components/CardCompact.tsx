import { Bath, Bed, Heart, House, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const CardCompact = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
  isHovered = false,
}: CardCompactProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg"
  );

  return (
    <div
      id={`property-${property.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 w-full flex h-40 mb-5 overflow-hidden ${
        isHovered
          ? "border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg scale-[1.01]"
          : "border-slate-200/80 shadow-xs hover:shadow-md"
      }`}
    >
      <div className="relative w-1/3">
        <Image
          src={imgSrc}
          alt={property.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
        <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
          {property.distanceKm !== undefined && (
            <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit shadow-xs flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {property.distanceKm} km
            </span>
          )}
          {property.campusZone && (
            <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md w-fit">
              {property.campusZone}
            </span>
          )}
          <span className="bg-emerald-700/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md w-fit">
            Escrow
          </span>
        </div>
      </div>
      <div className="w-2/3 p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h2 className="text-base font-bold text-slate-900 truncate pr-2">
              {propertyLink ? (
                <Link
                  href={propertyLink}
                  className="hover:underline hover:text-emerald-700 transition-colors"
                  scroll={false}
                >
                  {property.name}
                </Link>
              ) : (
                property.name
              )}
            </h2>
            {showFavoriteButton && (
              <button
                className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-2xs transition-transform active:scale-95"
                onClick={onFavoriteToggle}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-slate-500"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-slate-500 mb-1 text-xs truncate">
            {property.landmark ? `${property.landmark}, ` : ""}
            {property?.location?.address || property.campusZone}
          </p>
          <div className="flex text-xs items-center">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
            <span className="font-semibold text-slate-800">
              {property.averageRating.toFixed(1)}
            </span>
            <span className="text-slate-400 ml-1">
              ({property.numberOfReviews})
            </span>
          </div>
        </div>
        <div className="flex justify-between items-end text-xs">
          <div className="flex gap-2.5 text-slate-600 font-medium">
            <span className="flex items-center">
              <Bed className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {property.beds}
            </span>
            <span className="flex items-center">
              <Bath className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {property.baths}
            </span>
            <span className="flex items-center">
              <House className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {property.propertyType}
            </span>
          </div>

          <div className="text-right">
            <p className="text-base font-extrabold text-slate-900 tracking-tight">
              ₦{property.annualRent?.toLocaleString()}
              <span className="text-slate-500 text-[11px] font-normal"> /yr</span>
            </p>
            <p className="text-[11px] font-semibold text-emerald-800">
              Total: ₦
              {(
                (property.annualRent || 0) +
                (property.agentFee || 0) +
                (property.cautionDeposit || 0) +
                (property.platformFee || 0)
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCompact;
