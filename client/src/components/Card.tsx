import { Bath, Bed, Heart, House, MapPin, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import HeartButton from "@/components/HeartButton";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
  isHovered = false,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg"
  );

  return (
    <div
      id={`property-${property.id}`}
      className={`bg-card rounded-2xl border transition-all duration-200 w-full mb-5 text-card-foreground ${
        isHovered
          ? "border-primary ring-2 ring-primary/40 shadow-lg scale-[1.01]"
          : "border-border/80 shadow-xs hover:border-border hover:shadow-md"
      }`}
    >
      <div className="relative">
        <div className="w-full h-48 relative bg-muted">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover rounded-t-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {property.distanceKm !== undefined && (
            <span className="bg-primary/95 backdrop-blur-xs text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              {property.distanceKm} km away
            </span>
          )}
          {property.campusZone && (
            <span className="bg-background/85 backdrop-blur-xs text-foreground text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-border">
              {property.campusZone}
            </span>
          )}
          <span className="bg-primary/85 backdrop-blur-xs text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Protected Booking
          </span>
          {property.isParkingIncluded && (
            <span className="bg-card/90 backdrop-blur-xs text-card-foreground border border-border text-xs font-medium px-2 py-0.5 rounded-lg">
              Parking
            </span>
          )}
        </div>
        {showFavoriteButton && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <HeartButton propertyId={property.id} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-1 text-foreground tracking-tight">
          {propertyLink ? (
            <Link
              href={propertyLink}
              className="hover:underline hover:text-primary transition-colors"
              scroll={false}
            >
              {property.name}
            </Link>
          ) : (
            property.name
          )}
        </h2>
        <p className="text-muted-foreground mb-2.5 text-xs truncate">
          {property.landmark ? `${property.landmark}, ` : ""}
          {property?.location?.address || property.campusZone},{" "}
          {property?.location?.city || "Ilorin"}
        </p>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
            <span className="font-semibold text-xs text-foreground">
              {property.averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground ml-1 text-xs">
              ({property.numberOfReviews})
            </span>
          </div>
          <p className="text-lg font-extrabold text-foreground tracking-tight">
            ₦{property.annualRent?.toLocaleString()}{" "}
            <span className="text-muted-foreground text-xs font-normal"> /yr</span>
          </p>
        </div>
        <div className="bg-muted border border-border rounded-xl p-2.5 mb-3 text-xs text-muted-foreground flex justify-between items-center">
          <span className="text-foreground font-medium">Total Upfront:</span>
          <span className="font-bold text-primary text-xs">
            ₦
            {(
              (property.annualRent || 0) +
              (property.agentFee || 0) +
              (property.cautionDeposit || 0) +
              (property.platformFee || 0)
            ).toLocaleString()}
          </span>
        </div>
        <hr className="border-border" />
        <div className="flex justify-between items-center gap-4 text-muted-foreground mt-3 text-xs font-medium">
          <span className="flex items-center">
            <Bed className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            {property.beds} Bed
          </span>
          <span className="flex items-center">
            <Bath className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            {property.baths} Bath
          </span>
          <span className="flex items-center">
            <House className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            {property.propertyType}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
